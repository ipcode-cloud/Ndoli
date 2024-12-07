import { Document } from 'mongoose';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Student extends Document {
  name: string;
  email: string;
  grade: '9th' | '10th' | '11th' | '12th';
  status: 'Active' | 'Inactive' | 'Suspended';
  createdAt: Date;
  updatedAt: Date;
}

// New interface for student form data
export interface StudentFormData {
  id?: string;
  name: string;
  email: string;
  grade: Student['grade'];
  status: Student['status'];
}

export interface CreateStudentData {
  name: string;
  email: string;
  grade: Student['grade'];
  status: Student['status'];
}

export interface UpdateStudentData extends Partial<CreateStudentData> {}

export interface Class {
  id: string;
  name: string;
  schedule: Schedule[];
  assignments: Assignment[];
}

export interface Schedule {
  day: string;
  startTime: string;
  endTime: string;
  room: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  classId: string;
}