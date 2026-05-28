import { getToken } from '../api/client';

export function useAuth() {
  const isAuthenticated = Boolean(getToken());
  return { isAuthenticated };
}
