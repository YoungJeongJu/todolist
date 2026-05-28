import client from './client';

export const authApi = {
  login: (email: string, password: string) =>
    client.post('/auth/login', { email, password }),

  register: (email: string, password: string, name: string) =>
    client.post('/auth/register', { email, password, name }),

  logout: () => client.post('/auth/logout'),
};
