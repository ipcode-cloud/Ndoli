import mongoose from 'mongoose';
import { Student } from '@/lib/types';

const studentSchema = new mongoose.Schema<Student>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  grade: {
    type: String,
    required: [true, 'Grade is required'],
    enum: ['9th', '10th', '11th', '12th'],
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: ['Active', 'Inactive', 'Suspended'],
    default: 'Active',
  },
}, {
  timestamps: true,
});

// Add indexes
studentSchema.index({ email: 1 }, { unique: true });

export default mongoose.models.Student || mongoose.model<Student>('Student', studentSchema); 