import mongoose from 'mongoose';

const workoutSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    activityName: {
      type: String,
      required: [true, 'Activity name is required'],
      trim: true
    },
    activityType: {
      type: String,
      required: [true, 'Activity type is required'],
      enum: ['Pilates', 'Yoga', 'Walking', 'Running', 'Strength', 'Dance', 'Stretching', 'Cycling', 'Swimming', 'Other'],
      default: 'Walking'
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Duration in minutes is required'],
      min: [1, 'Duration must be at least 1 minute']
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    activityDate: {
      type: Date,
      default: Date.now,
      index: true
    },
    completed: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Workout', workoutSchema);
