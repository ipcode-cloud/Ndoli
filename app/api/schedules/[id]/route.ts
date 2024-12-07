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

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as CustomSession;
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();
    const schedule = await Schedule.findById(params.id).populate('subjectId', 'name code');

    if (!schedule) {
      return new NextResponse("Schedule not found", { status: 404 });
    }

    return NextResponse.json(schedule);
  } catch (error) {
    console.error("[SCHEDULE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as CustomSession;
    if (!session?.user?.role || session.user.role !== 'admin') {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { subjectId, grade, day, startTime, endTime, room } = body;

    if (!subjectId || !grade || !day || !startTime || !endTime || !room) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    await dbConnect();

    // Check for time conflicts with other schedules
    const conflictingSchedule = await Schedule.findOne({
      _id: { $ne: params.id },
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
      return new NextResponse("Time slot conflicts with an existing schedule", { status: 400 });
    }

    const schedule = await Schedule.findByIdAndUpdate(
      params.id,
      {
        subjectId,
        grade,
        day,
        startTime,
        endTime,
        room
      },
      { new: true }
    ).populate('subjectId', 'name code');

    if (!schedule) {
      return new NextResponse("Schedule not found", { status: 404 });
    }

    return NextResponse.json(schedule);
  } catch (error) {
    console.error("[SCHEDULE_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions) as CustomSession;
    if (!session?.user?.role || session.user.role !== 'admin') {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();
    const schedule = await Schedule.findByIdAndDelete(params.id);

    if (!schedule) {
      return new NextResponse("Schedule not found", { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[SCHEDULE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 