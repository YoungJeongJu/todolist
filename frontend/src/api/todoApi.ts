import client from './client';

export const todoApi = {
  getAll: () => client.get('/todos'),
  getOne: (id: string) => client.get(`/todos/${id}`),
  create: (data: unknown) => client.post('/todos', data),
  update: (id: string, data: unknown) => client.patch(`/todos/${id}`, data),
  remove: (id: string) => client.delete(`/todos/${id}`),
};
