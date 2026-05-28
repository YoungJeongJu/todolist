import * as todoService from '../services/todo.service.js';

export async function getTodos(req, res, next) {
  try {
    const { status, categoryId } = req.query;
    const result = await todoService.getTodos(req.user.id, { status, categoryId });
    res.status(200).json(result);
  } catch (err) { next(err); }
}

export async function createTodo(req, res, next) {
  try {
    const result = await todoService.createTodo(req.user.id, req.body);
    res.status(201).json(result);
  } catch (err) { next(err); }
}

export async function updateTodo(req, res, next) {
  try {
    const result = await todoService.updateTodo(req.user.id, req.params.id, req.body);
    res.status(200).json(result);
  } catch (err) { next(err); }
}

export async function updateTodoStatus(req, res, next) {
  try {
    const result = await todoService.updateTodoStatus(req.user.id, req.params.id, req.body.status);
    res.status(200).json(result);
  } catch (err) { next(err); }
}

export async function deleteTodo(req, res, next) {
  try {
    await todoService.deleteTodo(req.user.id, req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
}
