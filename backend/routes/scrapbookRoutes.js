import express from 'express';
import {
  getScrapbookEntries,
  createScrapbookEntry,
  getScrapbookEntryById,
  updateScrapbookEntry,
  deleteScrapbookEntry
} from '../controllers/scrapbookController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getScrapbookEntries)
  .post(createScrapbookEntry);

router.route('/:id')
  .get(getScrapbookEntryById)
  .patch(updateScrapbookEntry)
  .delete(deleteScrapbookEntry);

export default router;
