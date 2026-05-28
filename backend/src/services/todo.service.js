import * as todoRepo from '../repositories/todo.repository.js';
import { findDefaultCategoryByUserId } from '../repositories/category.repository.js';

function toDateStr(val) {
  if (!val) return null;
  if (val instanceof Date) return val.toISOString().slice(0, 10);
  return String(val).slice(0, 10);
}

function calcIsOverdue(todo) {
  if (!todo.dueDate || todo.status === 'DONE') return false;
  const today = new Date().toISOString().slice(0, 10);
  return toDateStr(todo.dueDate) < today;
}

function withIsOverdue(todo) {
  return { ...todo, isOverdue: calcIsOverdue(todo) };
}

function validateTodoFields({ title, description, startDate, dueDate }) {
  if (title !== undefined) {
    if (!title || title.trim().length < 1 || title.trim().length > 100) {
      const err = new Error('제목은 1~100자여야 합니다.'); err.status = 400; err.code = 'VALIDATION_ERROR'; throw err;
    }
  }
  if (description !== undefined && description !== null && description.length > 1000) {
    const err = new Error('설명은 최대 1000자입니다.'); err.status = 400; err.code = 'VALIDATION_ERROR'; throw err;
  }
  if (startDate && dueDate && dueDate < startDate) {
    const err = new Error('종료일은 시작일보다 같거나 이후여야 합니다.'); err.status = 400; err.code = 'INVALID_DATE_RANGE'; throw err;
  }
}

export async function getTodos(userId, { status, categoryId } = {}) {
  const VALID_STATUS_FILTERS = ['NOT_STARTED', 'IN_PROGRESS', 'DONE', 'OVERDUE'];
  if (status && !VALID_STATUS_FILTERS.includes(status)) {
    const err = new Error('status 파라미터가 유효하지 않습니다.'); err.status = 400; err.code = 'VALIDATION_ERROR'; throw err;
  }
  const todos = await todoRepo.findTodosByFilter(userId, { status, categoryId });
  return { todos: todos.map(withIsOverdue) };
}

export async function createTodo(userId, { title, description, startDate, dueDate, categoryId }) {
  if (!title) { const err = new Error('제목은 필수입니다.'); err.status = 400; err.code = 'VALIDATION_ERROR'; throw err; }
  validateTodoFields({ title, description, startDate, dueDate });
  let resolvedCategoryId = categoryId;
  if (!resolvedCategoryId) {
    const defaultCat = await findDefaultCategoryByUserId(userId);
    resolvedCategoryId = defaultCat.id;
  }
  const todo = await todoRepo.createTodo({ userId, categoryId: resolvedCategoryId, title: title.trim(), description, startDate: startDate ?? null, dueDate: dueDate ?? null });
  return { todo: withIsOverdue(todo) };
}

export async function updateTodo(userId, todoId, fields) {
  const todo = await todoRepo.findTodoById(todoId);
  if (!todo) { const err = new Error('할 일을 찾을 수 없습니다.'); err.status = 404; err.code = 'NOT_FOUND'; throw err; }
  if (todo.userId !== userId) { const err = new Error('접근 권한이 없습니다.'); err.status = 403; err.code = 'FORBIDDEN'; throw err; }

  const effectiveStartDate = fields.startDate !== undefined ? fields.startDate : toDateStr(todo.startDate);
  const effectiveDueDate = fields.dueDate !== undefined ? fields.dueDate : toDateStr(todo.dueDate);
  validateTodoFields({ title: fields.title, description: fields.description, startDate: effectiveStartDate, dueDate: effectiveDueDate });

  const updated = await todoRepo.updateTodo(todoId, fields);
  return { todo: withIsOverdue(updated) };
}

export async function updateTodoStatus(userId, todoId, status) {
  const VALID_STATUSES = ['NOT_STARTED', 'IN_PROGRESS', 'DONE'];
  if (!VALID_STATUSES.includes(status)) {
    const err = new Error('status는 NOT_STARTED, IN_PROGRESS, DONE 중 하나여야 합니다.'); err.status = 400; err.code = 'VALIDATION_ERROR'; throw err;
  }
  const todo = await todoRepo.findTodoById(todoId);
  if (!todo) { const err = new Error('할 일을 찾을 수 없습니다.'); err.status = 404; err.code = 'NOT_FOUND'; throw err; }
  if (todo.userId !== userId) { const err = new Error('접근 권한이 없습니다.'); err.status = 403; err.code = 'FORBIDDEN'; throw err; }
  const updated = await todoRepo.updateTodoStatus(todoId, status);
  return { todo: withIsOverdue(updated) };
}

export async function deleteTodo(userId, todoId) {
  const todo = await todoRepo.findTodoById(todoId);
  if (!todo) { const err = new Error('할 일을 찾을 수 없습니다.'); err.status = 404; err.code = 'NOT_FOUND'; throw err; }
  if (todo.userId !== userId) { const err = new Error('접근 권한이 없습니다.'); err.status = 403; err.code = 'FORBIDDEN'; throw err; }
  await todoRepo.deleteTodo(todoId);
}
