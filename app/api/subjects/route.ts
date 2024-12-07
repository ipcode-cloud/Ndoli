import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db-connect';
import Subject from '@/models/subject';
import { CreateSubjectData } from '@/lib/types';

export async function GET() {
  try {
    await dbConnect();
    const subjects = await Subject.find({}).sort({ code: 1 });
    return NextResponse.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subjects' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const data: CreateSubjectData = await request.json();

    const subject = await Subject.create(data);
    return NextResponse.json(subject, { status: 201 });
  } catch (error: any) {
    console.error('Error creating subject:', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Subject code already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create subject' },
      { status: 500 }
    );
  }
} 