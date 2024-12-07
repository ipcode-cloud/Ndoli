import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isValidObjectId } from 'mongoose';
import dbConnect from '@/lib/db-connect';
import Assignment from '@/models/assignment';

interface SessionUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

interface CustomSession {
  user?: SessionUser;
  expires: string;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions) as CustomSession;
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isValidObjectId(params.id)) {
    return NextResponse.json(
      { error: 'Invalid assignment ID' },
      { status: 400 }
    );
  }

  try {
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
  const session = await getServerSession(authOptions) as CustomSession;
  if (!session?.user?.role || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isValidObjectId(params.id)) {
    return NextResponse.json(
      { error: 'Invalid assignment ID' },
      { status: 400 }
    );
  }

  try {
    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.description || !data.subjectId || !data.dueDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate ObjectIds
    if (!isValidObjectId(data.subjectId)) {
      return NextResponse.json(
        { error: 'Invalid subject ID' },
        { status: 400 }
      );
    }

    // Ensure assignedTo is an array if provided
    if (data.assignedTo && (!Array.isArray(data.assignedTo))) {
      return NextResponse.json(
        { error: 'assignedTo must be an array of student IDs' },
        { status: 400 }
      );
    }

    // Validate student IDs if provided
    if (data.assignedTo?.length > 0) {
      for (const studentId of data.assignedTo) {
        if (!isValidObjectId(studentId)) {
          return NextResponse.json(
            { error: 'Invalid student ID in assignedTo array' },
            { status: 400 }
          );
        }
      }
    }

    // Validate dueDate
    const dueDate = new Date(data.dueDate);
    if (isNaN(dueDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid due date' },
        { status: 400 }
      );
    }

    await dbConnect();

    const assignment = await Assignment.findByIdAndUpdate(
      params.id,
      {
        ...data,
        dueDate: dueDate,
        assignedTo: data.assignedTo || []
      },
      { new: true }
    ).populate([
      { path: 'subjectId', select: 'name code' },
      { path: 'assignedTo', select: 'name email' }
    ]);

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
  const session = await getServerSession(authOptions) as CustomSession;
  if (!session?.user?.role || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isValidObjectId(params.id)) {
    return NextResponse.json(
      { error: 'Invalid assignment ID' },
      { status: 400 }
    );
  }

  try {
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