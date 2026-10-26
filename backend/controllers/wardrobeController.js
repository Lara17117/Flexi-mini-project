import WardrobeItem from '../models/WardrobeItem.js';

export const getWardrobeItems = async (req, res, next) => {
  try {
    const { category, color, season, isFavorite } = req.query;
    const filter = { userId: req.user._id };

    if (category && category !== 'all') filter.category = category;
    if (color && color !== 'all') filter.color = new RegExp(color, 'i');
    if (season && season !== 'all') filter.season = season;
    if (isFavorite === 'true') filter.isFavorite = true;

    const items = await WardrobeItem.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: items.length,
      items
    });
  } catch (err) {
    next(err);
  }
};

export const createWardrobeItem = async (req, res, next) => {
  try {
    const { name, description, category, color, season, occasion, imageUrl, isFavorite } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: 'Item name and category are required.'
      });
    }

    const item = await WardrobeItem.create({
      userId: req.user._id,
      name: name.trim(),
      description: description || '',
      category,
      color: color || 'Multi',
      season: season || 'all-season',
      occasion: occasion || 'Casual',
      imageUrl: imageUrl || '',
      isFavorite: !!isFavorite
    });

    res.status(201).json({
      success: true,
      item
    });
  } catch (err) {
    next(err);
  }
};

export const getWardrobeItemById = async (req, res, next) => {
  try {
    const item = await WardrobeItem.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Wardrobe item not found.'
      });
    }

    res.json({
      success: true,
      item
    });
  } catch (err) {
    next(err);
  }
};

export const updateWardrobeItem = async (req, res, next) => {
  try {
    const item = await WardrobeItem.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Wardrobe item not found or unauthorized.'
      });
    }

    res.json({
      success: true,
      item
    });
  } catch (err) {
    next(err);
  }
};

export const deleteWardrobeItem = async (req, res, next) => {
  try {
    const item = await WardrobeItem.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Wardrobe item not found or unauthorized.'
      });
    }

    res.json({
      success: true,
      message: 'Wardrobe item removed.'
    });
  } catch (err) {
    next(err);
  }
};
