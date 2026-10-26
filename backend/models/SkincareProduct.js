import mongoose from 'mongoose';

const skincareProductSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    brand: {
      type: String,
      trim: true,
      default: ''
    },
    category: {
      type: String,
      enum: ['cleanser', 'toner', 'serum', 'moisturizer', 'sunscreen', 'mask', 'treatment', 'eye-cream', 'other'],
      default: 'other'
    },
    instructions: {
      type: String,
      trim: true,
      default: ''
    },
    imageUrl: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('SkincareProduct', skincareProductSchema);
