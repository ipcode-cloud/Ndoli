import mongoose from 'mongoose';
import { Schedule } from '@/lib/types';

const scheduleSchema = new mongoose.Schema<Schedule>({
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, 'Subject ID is required'],
  },
  day: {
    type: String,
    required: [true, 'Day is required'],
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    validate: {
      validator: function(v: string) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Start time must be in HH:MM format'
    }
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    validate: {
      validator: function(v: string) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'End time must be in HH:MM format'
    }
  },
  room: {
    type: String,
    required: [true, 'Room is required'],
    trim: true,
  },
  grade: {
    type: String,
    required: [true, 'Grade is required'],
    enum: ['9th', '10th', '11th', '12th'],
  },
}, {
  timestamps: true,
});

// Add indexes
scheduleSchema.index({ subjectId: 1 });
scheduleSchema.index({ day: 1 });
scheduleSchema.index({ grade: 1 });

// Validate that end time is after start time
scheduleSchema.pre('save', function(next) {
  const start = this.startTime.split(':').map(Number);
  const end = this.endTime.split(':').map(Number);
  
  if (start[0] > end[0] || (start[0] === end[0] && start[1] >= end[1])) {
    next(new Error('End time must be after start time'));
  } else {
    next();
  }
});

// Validate no time conflicts for same grade and day
scheduleSchema.pre('save', async function(next) {
  const Schedule = this.constructor as mongoose.Model<Schedule>;
  
  const conflicts = await Schedule.find({
    _id: { $ne: this._id },
    grade: this.grade,
    day: this.day,
    $or: [
      {
        startTime: { $lt: this.endTime },
        endTime: { $gt: this.startTime }
      }
    ]
  });

  if (conflicts.length > 0) {
    next(new Error('Time conflict with existing schedule'));
  } else {
    next();
  }
});

export default mongoose.models.Schedule || mongoose.model<Schedule>('Schedule', scheduleSchema); 