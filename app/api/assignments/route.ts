import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from '@/lib/db-connect';
import Assignment from '@/models/assignment';
import { isValidObjectId } from 'mongoose';

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

export async function GET(request: Request) {
  const session = await getServerSession(authOptions) as CustomSession;
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    const status = searchParams.get('status');
    const studentId = searchParams.get('studentId');

    const query: any = {};

    if (subjectId) {
      if (!isValidObjectId(subjectId)) {
        return NextResponse.json({ error: 'Invalid subject ID' }, { status: 400 });
      }
      query.subjectId = subjectId;
    }

    if (status) {
      query.status = status;
    }

    if (studentId) {
      if (!isValidObjectId(studentId)) {
        return NextResponse.json({ error: 'Invalid student ID' }, { status: 400 });
      }
      query.assignedTo = studentId;
    }

    await dbConnect();
    const assignments = await Assignment.find(query)
      .populate('subjectId', 'name code')
      .populate('assignedTo', 'name email')
      .sort({ dueDate: 1 });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions) as CustomSession;
  if (!session?.user?.role || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.description || !data.subjectId || !data.dueDate || !data.assignedTo) {
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

    // Validate assignedTo array
    if (!Array.isArray(data.assignedTo) || !data.assignedTo.length) {
      return NextResponse.json(
        { error: 'assignedTo must be a non-empty array of student IDs' },
        { status: 400 }
      );
    }

    // Validate each student ID in assignedTo
    for (const studentId of data.assignedTo) {
      if (!isValidObjectId(studentId)) {
        return NextResponse.json(
          { error: 'Invalid student ID in assignedTo array' },
          { status: 400 }
        );
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
    
    const assignment = await Assignment.create({
      ...data,
      status: 'Not Started',
      dueDate: dueDate
    });

    const populatedAssignment = await assignment.populate([
      { path: 'subjectId', select: 'name code' },
      { path: 'assignedTo', select: 'name email' }
    ]);

    return NextResponse.json(populatedAssignment, { status: 201 });
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json(
      { error: 'Failed to create assignment' },
      { status: 500 }
    );
  }
} 