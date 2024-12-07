import { Document } from 'mongoose';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  grade: '9th' | '10th' | '11th' | '12th';
  status: 'Active' | 'Inactive' | 'Suspended';
  createdAt: string;
  updatedAt: string;
}

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

export interface Subject extends Document {
  name: string;
  code: string;
  description?: string;
}

export interface CreateSubjectData {
  name: string;
  code: string;
  description?: string;
}

export interface UpdateSubjectData extends Partial<CreateSubjectData> {}

export interface AcademicProgress {
  id: string;
  studentId: string;
  subjectId: string;
  grade: string;
  score: number;
  term: 'First' | 'Second' | 'Third' | 'Final';
  academicYear: string;
  lastUpdated: Date;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  dueDate: Date;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Late';
  assignedTo: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Schedule {
  id: string;
  subjectId: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  startTime: string;
  endTime: string;
  room: string;
  grade: Student['grade'];
}

export interface Class {
  id: string;
  name: string;
  schedule: Schedule[];
  assignments: Assignment[];
}