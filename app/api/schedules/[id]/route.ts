import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isValidObjectId } from 'mongoose';
import dbConnect from '@/lib/db-connect';
import Schedule from '@/models/schedule';

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
        { error: 'Invalid schedule ID' },
        { status: 400 }
      );
    }

    await dbConnect();
    const schedule = await Schedule.findById(params.id)
      .populate('subjectId', 'name code');

    if (!schedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
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
        { error: 'Invalid schedule ID' },
        { status: 400 }
      );
    }

    const data = await request.json();

    // Validate day if provided
    if (data.day) {
      const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      if (!validDays.includes(data.day)) {
        return NextResponse.json(
          { error: 'Invalid day. Must be one of: ' + validDays.join(', ') },
          { status: 400 }
        );
      }
    }

    // Validate grade if provided
    if (data.grade) {
      const validGrades = ['9th', '10th', '11th', '12th'];
      if (!validGrades.includes(data.grade)) {
        return NextResponse.json(
          { error: 'Invalid grade. Must be one of: ' + validGrades.join(', ') },
          { status: 400 }
        );
      }
    }

    // Validate time format if provided
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (data.startTime && !timeRegex.test(data.startTime)) {
      return NextResponse.json(
        { error: 'Invalid start time format. Must be in HH:MM format' },
        { status: 400 }
      );
    }
    if (data.endTime && !timeRegex.test(data.endTime)) {
      return NextResponse.json(
        { error: 'Invalid end time format. Must be in HH:MM format' },
        { status: 400 }
      );
    }

    // If both times are provided, validate end time is after start time
    if (data.startTime && data.endTime) {
      const [startHour, startMinute] = data.startTime.split(':').map(Number);
      const [endHour, endMinute] = data.endTime.split(':').map(Number);
      
      if (startHour > endHour || (startHour === endHour && startMinute >= endMinute)) {
        return NextResponse.json(
          { error: 'End time must be after start time' },
          { status: 400 }
        );
      }
    }

    await dbConnect();

    // Get current schedule data for conflict checking
    const currentSchedule = await Schedule.findById(params.id);
    if (!currentSchedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }

    // Check for time conflicts with other schedules
    if (data.startTime || data.endTime || data.day || data.grade) {
      const conflictQuery = {
        _id: { $ne: params.id },
        grade: data.grade || currentSchedule.grade,
        day: data.day || currentSchedule.day,
        $or: [
          {
            startTime: { $lt: data.endTime || currentSchedule.endTime },
            endTime: { $gt: data.startTime || currentSchedule.startTime }
          }
        ]
      };

      const conflictingSchedule = await Schedule.findOne(conflictQuery);
      if (conflictingSchedule) {
        return NextResponse.json(
          { error: 'Time conflict with existing schedule' },
          { status: 400 }
        );
      }
    }

    const schedule = await Schedule.findByIdAndUpdate(
      params.id,
      { $set: data },
      { new: true, runValidators: true }
    ).populate('subjectId', 'name code');

    if (!schedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Error updating schedule:', error);
    return NextResponse.json(
      { error: 'Failed to update schedule' },
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
        { error: 'Invalid schedule ID' },
        { status: 400 }
      );
    }

    await dbConnect();
    const schedule = await Schedule.findByIdAndDelete(params.id);

    if (!schedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    return NextResponse.json(
      { error: 'Failed to delete schedule' },
      { status: 500 }
    );
  }
} 