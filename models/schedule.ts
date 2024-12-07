import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  grade: {
    type: String,
    required: true,
    enum: ['9th', '10th', '11th', '12th']
  },
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  },
  startTime: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'Start time must be in HH:MM format'
    }
  },
  endTime: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: 'End time must be in HH:MM format'
    }
  },
  room: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Validate that end time is after start time
scheduleSchema.pre('save', function(next) {
  const [startHour, startMinute] = this.startTime.split(':').map(Number);
  const [endHour, endMinute] = this.endTime.split(':').map(Number);
  
  if (startHour > endHour || (startHour === endHour && startMinute >= endMinute)) {
    next(new Error('End time must be after start time'));
  } else {
    next();
  }
});

const Schedule = mongoose.models.Schedule || mongoose.model('Schedule', scheduleSchema);

export default Schedule; 