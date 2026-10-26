import express from 'express';
import {
  getWorkouts,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  getWorkoutSummary
} from '../controllers/workoutController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/summary', getWorkoutSummary);

router.route('/')
  .get(getWorkouts)
  .post(createWorkout);

router.route('/:id')
  .patch(updateWorkout)
  .delete(deleteWorkout);

export default router;
