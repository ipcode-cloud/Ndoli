import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Pending', 'Submitted', 'Late', 'Graded'],
    default: 'Pending'
  },
  grade: {
    type: Number,
    min: 0,
    max: 100
  },
  feedback: String,
  attachments: [{
    fileName: String,
    fileUrl: String,
    uploadedAt: Date
  }]
}, {
  timestamps: true
});

// Create a compound index to ensure a student can only have one submission per assignment
submissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

const Submission = mongoose.models.Submission || mongoose.model('Submission', submissionSchema);

export default Submission; 