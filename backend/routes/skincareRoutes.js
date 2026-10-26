import express from 'express';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getRoutine,
  createRoutineStep,
  updateRoutineStep,
  deleteRoutineStep,
  getCompletions,
  toggleCompletion
} from '../controllers/skincareController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Products
router.route('/products')
  .get(getProducts)
  .post(createProduct);

router.route('/products/:id')
  .patch(updateProduct)
  .delete(deleteProduct);

// Routine Steps
router.route('/routine')
  .get(getRoutine)
  .post(createRoutineStep);

router.route('/routine/:id')
  .patch(updateRoutineStep)
  .delete(deleteRoutineStep);

// Completions
router.route('/completions')
  .get(getCompletions)
  .post(toggleCompletion);

export default router;
