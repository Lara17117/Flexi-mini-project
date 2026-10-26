import mongoose from 'mongoose';

const wardrobeItemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['tops', 'bottoms', 'dresses', 'outerwear', 'footwear', 'accessories'],
      index: true
    },
    color: {
      type: String,
      trim: true,
      default: 'Multi'
    },
    season: {
      type: String,
      enum: ['all-season', 'spring', 'summer', 'fall', 'winter'],
      default: 'all-season'
    },
    occasion: {
      type: String,
      trim: true,
      default: 'Casual'
    },
    imageUrl: {
      type: String,
      default: ''
    },
    isFavorite: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('WardrobeItem', wardrobeItemSchema);
