import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import * as todoController from '../controllers/todo.controller.js';

const router = Router();

router.get('/', authenticate, todoController.getTodos);
router.post('/', authenticate, todoController.createTodo);
router.patch('/:id/status', authenticate, todoController.updateTodoStatus);
router.patch('/:id', authenticate, todoController.updateTodo);
router.delete('/:id', authenticate, todoController.deleteTodo);

export default router;
