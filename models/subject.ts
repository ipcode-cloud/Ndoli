import mongoose from 'mongoose';
import { Subject } from '@/lib/types';

const subjectSchema = new mongoose.Schema<Subject>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  code: {
    type: String,
    required: [true, 'Code is required'],
    unique: true,
    trim: true,
    uppercase: true,
  },
  description: {
    type: String,
    trim: true,
  },
  credits: {
    type: Number,
    required: [true, 'Credits are required'],
    min: [1, 'Credits must be at least 1'],
  },
  teacher: {
    type: String,
    required: [true, 'Teacher name is required'],
    trim: true,
  },
}, {
  timestamps: true,
});

// Add indexes
subjectSchema.index({ code: 1 }, { unique: true });

export default mongoose.models.Subject || mongoose.model<Subject>('Subject', subjectSchema); 