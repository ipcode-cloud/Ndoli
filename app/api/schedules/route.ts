import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from '@/lib/db-connect';
import Schedule from '@/models/schedule';
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
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    const day = searchParams.get('day');
    const grade = searchParams.get('grade');

    const query: any = {};

    if (subjectId) {
      if (!isValidObjectId(subjectId)) {
        return NextResponse.json({ error: 'Invalid subject ID' }, { status: 400 });
      }
      query.subjectId = subjectId;
    }

    if (day) {
      const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      if (!validDays.includes(day)) {
        return NextResponse.json({ error: 'Invalid day' }, { status: 400 });
      }
      query.day = day;
    }

    if (grade) {
      const validGrades = ['9th', '10th', '11th', '12th'];
      if (!validGrades.includes(grade)) {
        return NextResponse.json({ error: 'Invalid grade' }, { status: 400 });
      }
      query.grade = grade;
    }

    await dbConnect();
    const schedules = await Schedule.find(query)
      .populate('subjectId', 'name code')
      .sort({ day: 1, startTime: 1 });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedules' },
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
    if (!data.subjectId || !data.day || !data.startTime || !data.endTime || !data.room || !data.grade) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate ObjectId
    if (!isValidObjectId(data.subjectId)) {
      return NextResponse.json(
        { error: 'Invalid subject ID' },
        { status: 400 }
      );
    }

    // Validate day
    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    if (!validDays.includes(data.day)) {
      return NextResponse.json(
        { error: 'Invalid day. Must be one of: ' + validDays.join(', ') },
        { status: 400 }
      );
    }

    // Validate grade
    const validGrades = ['9th', '10th', '11th', '12th'];
    if (!validGrades.includes(data.grade)) {
      return NextResponse.json(
        { error: 'Invalid grade. Must be one of: ' + validGrades.join(', ') },
        { status: 400 }
      );
    }

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(data.startTime) || !timeRegex.test(data.endTime)) {
      return NextResponse.json(
        { error: 'Invalid time format. Must be in HH:MM format' },
        { status: 400 }
      );
    }

    // Validate end time is after start time
    const [startHour, startMinute] = data.startTime.split(':').map(Number);
    const [endHour, endMinute] = data.endTime.split(':').map(Number);
    
    if (startHour > endHour || (startHour === endHour && startMinute >= endMinute)) {
      return NextResponse.json(
        { error: 'End time must be after start time' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check for time conflicts
    const conflictingSchedule = await Schedule.findOne({
      grade: data.grade,
      day: data.day,
      $or: [
        {
          startTime: { $lt: data.endTime },
          endTime: { $gt: data.startTime }
        }
      ]
    });

    if (conflictingSchedule) {
      return NextResponse.json(
        { error: 'Time conflict with existing schedule' },
        { status: 400 }
      );
    }

    const schedule = await Schedule.create(data);
    const populatedSchedule = await schedule.populate('subjectId', 'name code');

    return NextResponse.json(populatedSchedule, { status: 201 });
  } catch (error) {
    console.error('Error creating schedule:', error);
    return NextResponse.json(
      { error: 'Failed to create schedule' },
      { status: 500 }
    );
  }
} 