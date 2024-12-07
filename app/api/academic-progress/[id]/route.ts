import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isValidObjectId } from 'mongoose';
import dbConnect from '@/lib/db-connect';
import AcademicProgress from '@/models/academic-progress';

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
        { error: 'Invalid academic progress ID' },
        { status: 400 }
      );
    }

    await dbConnect();
    const progress = await AcademicProgress.findById(params.id)
      .populate('studentId', 'name email')
      .populate('subjectId', 'name code');

    if (!progress) {
      return NextResponse.json(
        { error: 'Academic progress record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error fetching academic progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch academic progress' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
        { error: 'Invalid academic progress ID' },
        { status: 400 }
      );
    }

    const data = await request.json();

    // Validate score if provided
    if (data.score !== undefined && (data.score < 0 || data.score > 100)) {
      return NextResponse.json(
        { error: 'Score must be between 0 and 100' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if updating unique fields would create a duplicate
    if (data.studentId || data.subjectId || data.term || data.academicYear) {
      const existingProgress = await AcademicProgress.findOne({
        _id: { $ne: params.id },
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
    }

    const progress = await AcademicProgress.findByIdAndUpdate(
      params.id,
      { 
        ...data,
        lastUpdated: new Date()
      },
      { new: true, runValidators: true }
    ).populate('studentId', 'name email')
     .populate('subjectId', 'name code');

    if (!progress) {
      return NextResponse.json(
        { error: 'Academic progress record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error updating academic progress:', error);
    return NextResponse.json(
      { error: 'Failed to update academic progress' },
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
        { error: 'Invalid academic progress ID' },
        { status: 400 }
      );
    }

    await dbConnect();
    const progress = await AcademicProgress.findByIdAndDelete(params.id);

    if (!progress) {
      return NextResponse.json(
        { error: 'Academic progress record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Academic progress record deleted successfully' });
  } catch (error) {
    console.error('Error deleting academic progress:', error);
    return NextResponse.json(
      { error: 'Failed to delete academic progress' },
      { status: 500 }
    );
  }
} 