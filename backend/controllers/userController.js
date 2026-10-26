import User from '../models/User.js';
import WardrobeItem from '../models/WardrobeItem.js';
import ScrapbookEntry from '../models/ScrapbookEntry.js';
import SkincareProduct from '../models/SkincareProduct.js';
import SkincareRoutineStep from '../models/SkincareRoutineStep.js';
import SkincareCompletion from '../models/SkincareCompletion.js';
import Workout from '../models/Workout.js';

export const getProfile = async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, preferredMood } = req.body;
    const updates = {};
    if (name) updates.name = name.trim();
    if (preferredMood) updates.preferredMood = preferredMood;

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true
    }).select('-passwordHash');

    res.json({
      success: true,
      user: updatedUser
    });
  } catch (err) {
    next(err);
  }
};

export const updateMood = async (req, res, next) => {
  try {
    const { preferredMood } = req.body;
    if (!['happy', 'calm', 'romantic', 'low-key', 'energetic'].includes(preferredMood)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mood value.'
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { preferredMood },
      { new: true }
    ).select('-passwordHash');

    res.json({
      success: true,
      preferredMood: updatedUser.preferredMood
    });
  } catch (err) {
    next(err);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Delete all user related documents across all collections
    await Promise.all([
      WardrobeItem.deleteMany({ userId }),
      ScrapbookEntry.deleteMany({ userId }),
      SkincareProduct.deleteMany({ userId }),
      SkincareRoutineStep.deleteMany({ userId }),
      SkincareCompletion.deleteMany({ userId }),
      Workout.deleteMany({ userId }),
      User.findByIdAndDelete(userId)
    ]);

    res.json({
      success: true,
      message: 'Account and all associated universe data deleted.'
    });
  } catch (err) {
    next(err);
  }
};
