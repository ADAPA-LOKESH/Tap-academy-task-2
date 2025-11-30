import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  checkInTime: {
    type: Date,
    default: null
  },
  checkOutTime: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'half-day'],
    default: 'present'
  },
  totalHours: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index for user and date (one record per user per day)
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

// Calculate total hours before saving
attendanceSchema.pre('save', function(next) {
  if (this.checkInTime && this.checkOutTime) {
    const diff = this.checkOutTime.getTime() - this.checkInTime.getTime();
    this.totalHours = Math.round((diff / (1000 * 60 * 60)) * 100) / 100;
  }
  next();
});

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
