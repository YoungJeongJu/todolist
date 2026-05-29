import client from './client';
import type { Category } from '../types';

export const categoryApi = {
  getAll: () =>
    client.get<Category[]>('/categories'),

  create: (data: { name: string }) =>
    client.post<Category>('/categories', data),

  remove: (id: string) =>
    client.delete<void>(`/categories/${id}`),
};
