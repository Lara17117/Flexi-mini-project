import mongoose from 'mongoose';

const skincareCompletionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    routineStepId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SkincareRoutineStep',
      required: true
    },
    completionDate: {
      type: String, // 'YYYY-MM-DD'
      required: true,
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

skincareCompletionSchema.index({ userId: 1, routineStepId: 1, completionDate: 1 }, { unique: true });

export default mongoose.model('SkincareCompletion', skincareCompletionSchema);
