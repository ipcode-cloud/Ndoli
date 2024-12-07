import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db-connect';
import Submission from '@/models/submission';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const data = await request.json();

    const submission = await Submission.create(data);
    return NextResponse.json(submission, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('assignmentId');
    const studentId = searchParams.get('studentId');

    const query: any = {};
    if (assignmentId) query.assignmentId = assignmentId;
    if (studentId) query.studentId = studentId;

    const submissions = await Submission.find(query)
      .populate('studentId', 'name email')
      .populate('assignmentId', 'title dueDate');

    return NextResponse.json(submissions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
} 