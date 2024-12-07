import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UpdateStudentData } from "@/lib/types";
import connectDB from "@/lib/db";
import Student from "@/models/student";
import { Session } from "next-auth";
import { Types } from 'mongoose';

// Extend Session type to include role
interface CustomSession extends Session {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('GET request for student ID:', params.id);
  
  const session = await getServerSession(authOptions) as CustomSession;
  console.log('Session:', session);
  
  if (!session || session.user?.role !== 'admin') {
    console.log('Unauthorized access attempt');
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    if (!params.id) {
      console.log('No ID provided');
      return new NextResponse("Student ID is required", { status: 400 });
    }

    if (!Types.ObjectId.isValid(params.id)) {
      console.log('Invalid ObjectId:', params.id);
      return new NextResponse("Invalid student ID", { status: 400 });
    }

    console.log('Connecting to database...');
    await connectDB();
    
    console.log('Finding student...');
    const student = await Student.findById(new Types.ObjectId(params.id));
    console.log('Found student:', student);

    if (!student) {
      console.log('Student not found');
      return new NextResponse("Student not found", { status: 404 });
    }

    // Transform the data to ensure consistent ID format
    const transformedStudent = {
      ...student.toObject(),
      id: student._id.toString(),
      _id: undefined
    };

    console.log('Returning transformed student:', transformedStudent);
    return NextResponse.json(transformedStudent);
  } catch (error: unknown) {
    console.error('Error fetching student:', error);
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 500 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('PATCH request for student ID:', params.id);
  
  const session = await getServerSession(authOptions) as CustomSession;
  console.log('Session:', session);
  
  if (!session || session.user?.role !== 'admin') {
    console.log('Unauthorized access attempt');
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    if (!params.id || !Types.ObjectId.isValid(params.id)) {
      console.log('Invalid student ID:', params.id);
      return new NextResponse("Invalid student ID", { status: 400 });
    }

    const data: UpdateStudentData = await request.json();
    console.log('Update data:', data);

    console.log('Connecting to database...');
    await connectDB();

    // Check if student exists
    console.log('Finding student...');
    const student = await Student.findById(new Types.ObjectId(params.id));
    
    if (!student) {
      console.log('Student not found');
      return new NextResponse("Student not found", { status: 404 });
    }

    // If email is being updated, check if it's already in use by another student
    if (data.email && data.email !== student.email) {
      console.log('Checking email uniqueness...');
      const existingStudent = await Student.findOne({ 
        email: data.email.toLowerCase(),
        _id: { $ne: new Types.ObjectId(params.id) }
      });
      
      if (existingStudent) {
        console.log('Email already in use');
        return new NextResponse("Email already in use", { status: 400 });
      }
    }

    // Update student
    console.log('Updating student...');
    const updatedStudent = await Student.findByIdAndUpdate(
      new Types.ObjectId(params.id),
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!updatedStudent) {
      console.log('Failed to update student');
      return new NextResponse("Failed to update student", { status: 500 });
    }

    // Transform the data to ensure consistent ID format
    const transformedStudent = {
      ...updatedStudent.toObject(),
      id: updatedStudent._id.toString(),
      _id: undefined
    };

    console.log('Returning updated student:', transformedStudent);
    return NextResponse.json(transformedStudent);
  } catch (error: unknown) {
    console.error('Error updating student:', error);
    if (error instanceof Error) {
      if (error.name === 'ValidationError') {
        return new NextResponse(error.message, { status: 400 });
      }
      return new NextResponse(error.message, { status: 500 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('DELETE request for student ID:', params.id);
  
  const session = await getServerSession(authOptions) as CustomSession;
  console.log('Session:', session);
  
  if (!session || session.user?.role !== 'admin') {
    console.log('Unauthorized access attempt');
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    if (!params.id || !Types.ObjectId.isValid(params.id)) {
      console.log('Invalid student ID:', params.id);
      return new NextResponse("Invalid student ID", { status: 400 });
    }

    console.log('Connecting to database...');
    await connectDB();
    
    console.log('Deleting student...');
    const student = await Student.findByIdAndDelete(new Types.ObjectId(params.id));

    if (!student) {
      console.log('Student not found');
      return new NextResponse("Student not found", { status: 404 });
    }

    console.log('Student deleted successfully');
    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    console.error('Error deleting student:', error);
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 500 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 