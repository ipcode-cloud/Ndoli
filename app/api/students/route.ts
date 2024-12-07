import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CreateStudentData } from "@/lib/types";
import connectDB from "@/lib/db";
import Student from "@/models/student";
import { Session } from "next-auth";

// Extend Session type to include role
interface CustomSession extends Session {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  }
}

export async function GET() {
  const session = await getServerSession(authOptions) as CustomSession;
  
  if (!session || session.user?.role !== 'admin') {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    await connectDB();
    const students = await Student.find({}).sort({ createdAt: -1 });
    
    // Transform the data to ensure consistent ID format
    const transformedStudents = students.map(student => {
      const obj = student.toObject();
      return {
        ...obj,
        id: obj._id.toString(),
        _id: undefined
      };
    });
    
    return NextResponse.json(transformedStudents);
  } catch (error) {
    console.error('Error fetching students:', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions) as CustomSession;
  
  if (!session || session.user?.role !== 'admin') {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const data: CreateStudentData = await request.json();

    // Validate required fields
    if (!data.name || !data.email || !data.grade || !data.status) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    await connectDB();

    // Check if email is already in use
    const existingStudent = await Student.findOne({ email: data.email.toLowerCase() });
    if (existingStudent) {
      return new NextResponse("Email already in use", { status: 400 });
    }

    // Create new student
    const student = await Student.create(data);
    const transformedStudent = {
      ...student.toObject(),
      id: student._id.toString(),
      _id: undefined
    };
    
    return NextResponse.json(transformedStudent, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating student:', error);
    if (error instanceof Error) {
      if (error.name === 'ValidationError') {
        return new NextResponse(error.message, { status: 400 });
      }
      return new NextResponse(error.message, { status: 500 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 