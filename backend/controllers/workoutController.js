import Workout from '../models/Workout.js';

export const getWorkouts = async (req, res, next) => {
  try {
    const { type, completed, startDate, endDate } = req.query;
    const filter = { userId: req.user._id };

    if (type && type !== 'all') filter.activityType = type;
    if (completed !== undefined && completed !== 'all') filter.completed = completed === 'true';

    if (startDate || endDate) {
      filter.activityDate = {};
      if (startDate) filter.activityDate.$gte = new Date(startDate);
      if (endDate) filter.activityDate.$lte = new Date(endDate);
    }

    const workouts = await Workout.find(filter).sort({ activityDate: -1, createdAt: -1 });

    res.json({
      success: true,
      count: workouts.length,
      workouts
    });
  } catch (err) {
    next(err);
  }
};

export const createWorkout = async (req, res, next) => {
  try {
    const { activityName, activityType, durationMinutes, notes, activityDate, completed } = req.body;

    if (!activityName || !durationMinutes) {
      return res.status(400).json({
        success: false,
        message: 'Activity name and duration are required.'
      });
    }

    const workout = await Workout.create({
      userId: req.user._id,
      activityName: activityName.trim(),
      activityType: activityType || 'Walking',
      durationMinutes: Number(durationMinutes),
      notes: notes || '',
      activityDate: activityDate ? new Date(activityDate) : new Date(),
      completed: completed !== undefined ? !!completed : true
    });

    res.status(201).json({
      success: true,
      workout
    });
  } catch (err) {
    next(err);
  }
};

export const updateWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout session not found.'
      });
    }

    res.json({
      success: true,
      workout
    });
  } catch (err) {
    next(err);
  }
};

export const deleteWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout session not found.'
      });
    }

    res.json({
      success: true,
      message: 'Workout session removed.'
    });
  } catch (err) {
    next(err);
  }
};

export const getWorkoutSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get today's start and end
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const [allWorkouts, todayWorkouts] = await Promise.all([
      Workout.find({ userId }),
      Workout.find({
        userId,
        activityDate: { $gte: startOfToday, $lte: endOfToday }
      })
    ]);

    const totalMinutes = allWorkouts.reduce((acc, w) => acc + (w.completed ? w.durationMinutes : 0), 0);
    const todayMinutes = todayWorkouts.reduce((acc, w) => acc + (w.completed ? w.durationMinutes : 0), 0);
    const completedCount = allWorkouts.filter(w => w.completed).length;

    // Breakdown by type
    const byType = {};
    allWorkouts.forEach((w) => {
      byType[w.activityType] = (byType[w.activityType] || 0) + (w.completed ? w.durationMinutes : 0);
    });

    res.json({
      success: true,
      summary: {
        totalMinutes,
        todayMinutes,
        completedCount,
        todayCount: todayWorkouts.length,
        byType
      }
    });
  } catch (err) {
    next(err);
  }
};
