import mongoose from 'mongoose';
import { Assignment } from '@/lib/types';

const assignmentSchema = new mongoose.Schema<Assignment>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, 'Subject ID is required'],
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required'],
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: ['Not Started', 'In Progress', 'Completed', 'Late'],
    default: 'Not Started',
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student ID is required'],
  }],
}, {
  timestamps: true,
});

// Add indexes
assignmentSchema.index({ subjectId: 1 });
assignmentSchema.index({ dueDate: 1 });
assignmentSchema.index({ status: 1 });
assignmentSchema.index({ assignedTo: 1 });

export default mongoose.models.Assignment || mongoose.model<Assignment>('Assignment', assignmentSchema); 