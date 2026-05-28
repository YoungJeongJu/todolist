import client from './client';

export const categoryApi = {
  getAll: () => client.get('/categories'),
  create: (data: unknown) => client.post('/categories', data),
  update: (id: string, data: unknown) => client.patch(`/categories/${id}`, data),
  remove: (id: string) => client.delete(`/categories/${id}`),
};
