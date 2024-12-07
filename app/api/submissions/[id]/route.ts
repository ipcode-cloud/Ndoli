import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db-connect';
import Submission from '@/models/submission';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const submission = await Submission.findById(params.id)
      .populate('studentId', 'name email')
      .populate('assignmentId', 'title dueDate');

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    return NextResponse.json(submission);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const data = await request.json();

    const submission = await Submission.findByIdAndUpdate(
      params.id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    return NextResponse.json(submission);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const submission = await Submission.findByIdAndDelete(params.id);

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Submission deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
} 