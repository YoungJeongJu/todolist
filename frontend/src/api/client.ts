import axios from 'axios';

let token: string | null = null;

export function getToken(): string | null {
  return token;
}

export function setToken(newToken: string): void {
  token = newToken;
}

export function clearToken(): void {
  token = null;
}

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

client.interceptors.request.use((config) => {
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
