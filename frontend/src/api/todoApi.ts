import client from './client';
import type { Todo, TodoStatus, TodoFilters } from '../types';

export interface CreateTodoData {
  title: string;
  description?: string;
  startDate?: string;
  dueDate?: string;
  categoryId?: string;
}

export interface UpdateTodoData {
  title?: string;
  description?: string;
  startDate?: string;
  dueDate?: string;
  categoryId?: string;
}

export const todoApi = {
  getAll: (filters?: TodoFilters) => {
    const params: Record<string, string> = {};
    if (filters?.status) params.status = filters.status;
    if (filters?.categoryId) params.categoryId = filters.categoryId;
    return client.get<Todo[]>('/todos', { params });
  },

  create: (data: CreateTodoData) =>
    client.post<Todo>('/todos', data),

  update: (id: string, data: UpdateTodoData) =>
    client.patch<Todo>(`/todos/${id}`, data),

  remove: (id: string) =>
    client.delete<void>(`/todos/${id}`),

  updateStatus: (id: string, status: TodoStatus) =>
    client.patch<Todo>(`/todos/${id}/status`, { status }),
};
