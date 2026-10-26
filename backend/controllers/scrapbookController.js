import ScrapbookEntry from '../models/ScrapbookEntry.js';

export const getScrapbookEntries = async (req, res, next) => {
  try {
    const { search, tag, isFavorite } = req.query;
    const filter = { userId: req.user._id };

    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { content: new RegExp(search, 'i') }
      ];
    }

    if (tag && tag !== 'all') {
      filter.tags = tag;
    }

    if (isFavorite === 'true') {
      filter.isFavorite = true;
    }

    const entries = await ScrapbookEntry.find(filter).sort({ entryDate: -1, createdAt: -1 });

    res.json({
      success: true,
      count: entries.length,
      entries
    });
  } catch (err) {
    next(err);
  }
};

export const createScrapbookEntry = async (req, res, next) => {
  try {
    const { title, content, imageUrl, tags, entryDate, isFavorite } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and memory content are required.'
      });
    }

    const entry = await ScrapbookEntry.create({
      userId: req.user._id,
      title: title.trim(),
      content: content.trim(),
      imageUrl: imageUrl || '',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
      entryDate: entryDate ? new Date(entryDate) : new Date(),
      isFavorite: !!isFavorite
    });

    res.status(201).json({
      success: true,
      entry
    });
  } catch (err) {
    next(err);
  }
};

export const getScrapbookEntryById = async (req, res, next) => {
  try {
    const entry = await ScrapbookEntry.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Scrapbook memory not found.'
      });
    }

    res.json({
      success: true,
      entry
    });
  } catch (err) {
    next(err);
  }
};

export const updateScrapbookEntry = async (req, res, next) => {
  try {
    const { title, content, imageUrl, tags, entryDate, isFavorite } = req.body;
    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (content !== undefined) updates.content = content.trim();
    if (imageUrl !== undefined) updates.imageUrl = imageUrl;
    if (tags !== undefined) {
      updates.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
    }
    if (entryDate !== undefined) updates.entryDate = new Date(entryDate);
    if (isFavorite !== undefined) updates.isFavorite = !!isFavorite;

    const entry = await ScrapbookEntry.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Scrapbook entry not found or unauthorized.'
      });
    }

    res.json({
      success: true,
      entry
    });
  } catch (err) {
    next(err);
  }
};

export const deleteScrapbookEntry = async (req, res, next) => {
  try {
    const entry = await ScrapbookEntry.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Scrapbook entry not found or unauthorized.'
      });
    }

    res.json({
      success: true,
      message: 'Scrapbook entry removed.'
    });
  } catch (err) {
    next(err);
  }
};
