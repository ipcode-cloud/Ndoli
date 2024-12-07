import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isValidObjectId } from 'mongoose';
import dbConnect from '@/lib/db-connect';
import Assignment from '@/models/assignment';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (!isValidObjectId(params.id)) {
      return NextResponse.json(
        { error: 'Invalid assignment ID' },
        { status: 400 }
      );
    }

    await dbConnect();
    const assignment = await Assignment.findById(params.id)
      .populate('subjectId', 'name code')
      .populate('assignedTo', 'name email');

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(assignment);
  } catch (error) {
    console.error('Error fetching assignment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assignment' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (!isValidObjectId(params.id)) {
      return NextResponse.json(
        { error: 'Invalid assignment ID' },
        { status: 400 }
      );
    }

    const data = await request.json();

    // Only admin can update certain fields
    if (!session.user?.role === 'admin') {
      const allowedFields = ['status'];
      const providedFields = Object.keys(data);
      const hasDisallowedFields = providedFields.some(field => !allowedFields.includes(field));
      
      if (hasDisallowedFields) {
        return NextResponse.json(
          { error: 'You can only update the status of the assignment' },
          { status: 403 }
        );
      }
    }

    // Validate dueDate if provided
    if (data.dueDate) {
      const dueDate = new Date(data.dueDate);
      if (isNaN(dueDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid due date' },
          { status: 400 }
        );
      }
      data.dueDate = dueDate;
    }

    // Validate assignedTo if provided
    if (data.assignedTo) {
      if (!Array.isArray(data.assignedTo) || !data.assignedTo.length) {
        return NextResponse.json(
          { error: 'assignedTo must be a non-empty array of student IDs' },
          { status: 400 }
        );
      }

      // Validate each student ID
      for (const studentId of data.assignedTo) {
        if (!isValidObjectId(studentId)) {
          return NextResponse.json(
            { error: 'Invalid student ID in assignedTo array' },
            { status: 400 }
          );
        }
      }
    }

    await dbConnect();
    const assignment = await Assignment.findByIdAndUpdate(
      params.id,
      { $set: data },
      { new: true, runValidators: true }
    )
    .populate('subjectId', 'name code')
    .populate('assignedTo', 'name email');

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(assignment);
  } catch (error) {
    console.error('Error updating assignment:', error);
    return NextResponse.json(
      { error: 'Failed to update assignment' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (!isValidObjectId(params.id)) {
      return NextResponse.json(
        { error: 'Invalid assignment ID' },
        { status: 400 }
      );
    }

    await dbConnect();
    const assignment = await Assignment.findByIdAndDelete(params.id);

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return NextResponse.json(
      { error: 'Failed to delete assignment' },
      { status: 500 }
    );
  }
} 