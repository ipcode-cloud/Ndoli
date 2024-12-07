import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db-connect";
import Schedule from "@/models/schedule";

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

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as CustomSession;
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const schedules = await Schedule.find().populate('subjectId', 'name code');
    return NextResponse.json(schedules);
  } catch (error) {
    console.error("[SCHEDULES_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions) as CustomSession;
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { subjectId, grade, day, startTime, endTime, room } = body;

    if (!subjectId || !grade || !day || !startTime || !endTime || !room) {
      return NextResponse.json({ 
        error: "Missing required fields",
        details: {
          subjectId: !subjectId ? "Subject ID is required" : null,
          grade: !grade ? "Grade is required" : null,
          day: !day ? "Day is required" : null,
          startTime: !startTime ? "Start time is required" : null,
          endTime: !endTime ? "End time is required" : null,
          room: !room ? "Room is required" : null
        }
      }, { status: 400 });
    }

    await dbConnect();

    // Check for time conflicts
    const conflictingSchedule = await Schedule.findOne({
      grade,
      day,
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    });

    if (conflictingSchedule) {
      return NextResponse.json({ 
        error: "Time slot conflicts with an existing schedule",
        details: {
          conflictingSchedule: {
            startTime: conflictingSchedule.startTime,
            endTime: conflictingSchedule.endTime,
            day: conflictingSchedule.day
          }
        }
      }, { status: 400 });
    }

    const schedule = await Schedule.create({
      subjectId,
      grade,
      day,
      startTime,
      endTime,
      room
    });

    const populatedSchedule = await schedule.populate('subjectId', 'name code');
    return NextResponse.json(populatedSchedule);
  } catch (error) {
    console.error("[SCHEDULES_POST]", error);
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: error.message,
        details: error.stack
      }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 