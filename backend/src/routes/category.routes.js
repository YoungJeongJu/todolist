import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import * as categoryController from '../controllers/category.controller.js';

const router = Router();

router.get('/', authenticate, categoryController.getCategories);
router.post('/', authenticate, categoryController.createCategory);
router.delete('/:id', authenticate, categoryController.deleteCategory);

export default router;
