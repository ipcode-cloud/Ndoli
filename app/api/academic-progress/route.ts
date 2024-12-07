import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from '@/lib/db-connect';
import AcademicProgress from '@/models/academic-progress';
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
    const studentId = searchParams.get('studentId');
    const subjectId = searchParams.get('subjectId');
    const term = searchParams.get('term');
    const academicYear = searchParams.get('academicYear');

    const query: any = {};

    if (studentId) {
      if (!isValidObjectId(studentId)) {
        return NextResponse.json({ error: 'Invalid student ID' }, { status: 400 });
      }
      query.studentId = studentId;
    }

    if (subjectId) {
      if (!isValidObjectId(subjectId)) {
        return NextResponse.json({ error: 'Invalid subject ID' }, { status: 400 });
      }
      query.subjectId = subjectId;
    }

    if (term) query.term = term;
    if (academicYear) query.academicYear = academicYear;

    await dbConnect();
    const progress = await AcademicProgress.find(query)
      .populate('studentId', 'name email')
      .populate('subjectId', 'name code')
      .sort({ lastUpdated: -1 });

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error fetching academic progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch academic progress' },
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
    if (!data.studentId || !data.subjectId || !data.grade || !data.score || !data.term || !data.academicYear) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate ObjectIds
    if (!isValidObjectId(data.studentId) || !isValidObjectId(data.subjectId)) {
      return NextResponse.json(
        { error: 'Invalid student ID or subject ID' },
        { status: 400 }
      );
    }

    // Validate score range
    if (data.score < 0 || data.score > 100) {
      return NextResponse.json(
        { error: 'Score must be between 0 and 100' },
        { status: 400 }
      );
    }

    await dbConnect();
    
    // Check for existing record
    const existingProgress = await AcademicProgress.findOne({
      studentId: data.studentId,
      subjectId: data.subjectId,
      term: data.term,
      academicYear: data.academicYear
    });

    if (existingProgress) {
      return NextResponse.json(
        { error: 'Academic progress record already exists for this student, subject, term and academic year' },
        { status: 400 }
      );
    }

    const progress = await AcademicProgress.create({
      ...data,
      lastUpdated: new Date()
    });

    const populatedProgress = await progress.populate([
      { path: 'studentId', select: 'name email' },
      { path: 'subjectId', select: 'name code' }
    ]);

    return NextResponse.json(populatedProgress, { status: 201 });
  } catch (error) {
    console.error('Error creating academic progress:', error);
    return NextResponse.json(
      { error: 'Failed to create academic progress' },
      { status: 500 }
    );
  }
} 