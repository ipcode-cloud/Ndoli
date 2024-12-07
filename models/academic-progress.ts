import mongoose from 'mongoose';
import { AcademicProgress } from '@/lib/types';

const academicProgressSchema = new mongoose.Schema<AcademicProgress>({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student ID is required'],
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, 'Subject ID is required'],
  },
  grade: {
    type: String,
    required: [true, 'Grade is required'],
    trim: true,
  },
  score: {
    type: Number,
    required: [true, 'Score is required'],
    min: [0, 'Score cannot be less than 0'],
    max: [100, 'Score cannot be more than 100'],
  },
  term: {
    type: String,
    required: [true, 'Term is required'],
    enum: ['First', 'Second', 'Third', 'Final'],
  },
  academicYear: {
    type: String,
    required: [true, 'Academic year is required'],
    trim: true,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Add indexes
academicProgressSchema.index({ studentId: 1, subjectId: 1, term: 1, academicYear: 1 }, { unique: true });
academicProgressSchema.index({ studentId: 1 });
academicProgressSchema.index({ subjectId: 1 });

export default mongoose.models.AcademicProgress || mongoose.model<AcademicProgress>('AcademicProgress', academicProgressSchema); 