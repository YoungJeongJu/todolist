import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import * as authController from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.patch('/me', authenticate, authController.updateMe);
router.delete('/me', authenticate, authController.deleteMe);

export default router;
