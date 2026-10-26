import mongoose from 'mongoose';

const scrapbookEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Entry title is required'],
      trim: true
    },
    content: {
      type: String,
      required: [true, 'Memory or note content is required'],
      trim: true
    },
    imageUrl: {
      type: String,
      default: ''
    },
    tags: {
      type: [String],
      default: [],
      index: true
    },
    entryDate: {
      type: Date,
      default: Date.now,
      index: true
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

export default mongoose.model('ScrapbookEntry', scrapbookEntrySchema);
