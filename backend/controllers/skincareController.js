import SkincareProduct from '../models/SkincareProduct.js';
import SkincareRoutineStep from '../models/SkincareRoutineStep.js';
import SkincareCompletion from '../models/SkincareCompletion.js';

// --- PRODUCTS ---
export const getProducts = async (req, res, next) => {
  try {
    const products = await SkincareProduct.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { name, brand, category, instructions, imageUrl } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Product name is required.' });
    }

    const product = await SkincareProduct.create({
      userId: req.user._id,
      name: name.trim(),
      brand: brand || '',
      category: category || 'other',
      instructions: instructions || '',
      imageUrl: imageUrl || ''
    });

    res.status(201).json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await SkincareProduct.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await SkincareProduct.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    // Also remove any routine references
    await SkincareRoutineStep.updateMany(
      { userId: req.user._id, productId: req.params.id },
      { $set: { productId: null } }
    );
    res.json({ success: true, message: 'Product deleted.' });
  } catch (err) {
    next(err);
  }
};

// --- ROUTINE STEPS ---
export const getRoutine = async (req, res, next) => {
  try {
    const { timeOfDay } = req.query;
    const filter = { userId: req.user._id };
    if (timeOfDay && timeOfDay !== 'all') {
      filter.$or = [{ timeOfDay }, { timeOfDay: 'both' }];
    }

    const steps = await SkincareRoutineStep.find(filter)
      .populate('productId')
      .sort({ order: 1, createdAt: 1 });

    res.json({
      success: true,
      count: steps.length,
      steps
    });
  } catch (err) {
    next(err);
  }
};

export const createRoutineStep = async (req, res, next) => {
  try {
    const { name, timeOfDay, productId, order } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Step name is required.' });
    }

    const step = await SkincareRoutineStep.create({
      userId: req.user._id,
      name: name.trim(),
      timeOfDay: timeOfDay || 'morning',
      productId: productId || null,
      order: order !== undefined ? Number(order) : 0
    });

    const populated = await step.populate('productId');
    res.status(201).json({ success: true, step: populated });
  } catch (err) {
    next(err);
  }
};

export const updateRoutineStep = async (req, res, next) => {
  try {
    const step = await SkincareRoutineStep.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    ).populate('productId');

    if (!step) {
      return res.status(404).json({ success: false, message: 'Routine step not found.' });
    }
    res.json({ success: true, step });
  } catch (err) {
    next(err);
  }
};

export const deleteRoutineStep = async (req, res, next) => {
  try {
    const step = await SkincareRoutineStep.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    if (!step) {
      return res.status(404).json({ success: false, message: 'Routine step not found.' });
    }
    await SkincareCompletion.deleteMany({ routineStepId: req.params.id });
    res.json({ success: true, message: 'Routine step deleted.' });
  } catch (err) {
    next(err);
  }
};

// --- DAILY COMPLETIONS ---
export const getCompletions = async (req, res, next) => {
  try {
    const { date } = req.query;
    const queryDate = date || new Date().toISOString().split('T')[0];
    const completions = await SkincareCompletion.find({
      userId: req.user._id,
      completionDate: queryDate
    });

    res.json({
      success: true,
      date: queryDate,
      completions
    });
  } catch (err) {
    next(err);
  }
};

export const toggleCompletion = async (req, res, next) => {
  try {
    const { routineStepId, completionDate, completed } = req.body;
    const dateStr = completionDate || new Date().toISOString().split('T')[0];

    if (!routineStepId) {
      return res.status(400).json({ success: false, message: 'routineStepId is required.' });
    }

    const completion = await SkincareCompletion.findOneAndUpdate(
      { userId: req.user._id, routineStepId, completionDate: dateStr },
      { completed: completed !== undefined ? completed : true },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({
      success: true,
      completion
    });
  } catch (err) {
    next(err);
  }
};
