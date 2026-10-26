import mongoose from 'mongoose';

const skincareRoutineStepSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SkincareProduct',
      default: null
    },
    name: {
      type: String,
      required: [true, 'Step name is required'],
      trim: true
    },
    timeOfDay: {
      type: String,
      enum: ['morning', 'evening', 'both'],
      default: 'morning',
      index: true
    },
    order: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('SkincareRoutineStep', skincareRoutineStepSchema);
