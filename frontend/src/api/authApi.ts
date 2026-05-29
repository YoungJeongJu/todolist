import client from './client';
import type { User, ThemeMode } from '../types';

export interface AuthResponse {
  token: string;
  user: User;
}

export interface UpdateMeData {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
  themeMode?: ThemeMode;
}

export const authApi = {
  login: (email: string, password: string) =>
    client.post<AuthResponse>('/auth/login', { email, password }),

  register: (email: string, password: string, name: string) =>
    client.post<AuthResponse>('/auth/register', { email, password, name }),

  getMe: () =>
    client.get<User>('/auth/me'),

  updateMe: (data: UpdateMeData) =>
    client.patch<User>('/auth/me', data),

  deleteMe: () =>
    client.delete<void>('/auth/me'),
};
