import express from 'express';
import { getProfile, updateProfile, updateMood, deleteAccount } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/me', getProfile);
router.patch('/me', updateProfile);
router.patch('/me/mood', updateMood);
router.delete('/me', deleteAccount);

export default router;
