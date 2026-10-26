import express from 'express';
import {
  getWardrobeItems,
  createWardrobeItem,
  getWardrobeItemById,
  updateWardrobeItem,
  deleteWardrobeItem
} from '../controllers/wardrobeController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getWardrobeItems)
  .post(createWardrobeItem);

router.route('/:id')
  .get(getWardrobeItemById)
  .patch(updateWardrobeItem)
  .delete(deleteWardrobeItem);

export default router;
