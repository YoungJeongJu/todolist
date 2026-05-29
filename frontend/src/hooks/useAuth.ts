import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import type { UpdateMeData } from '../api/authApi';
import { getToken, setToken, clearToken } from '../api/client';
import { useThemeStore } from '../store/themeStore';
import type { User } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();
  const setTheme = useThemeStore((s) => s.setTheme);

  const isAuthenticated = Boolean(getToken());

  useEffect(() => {
    if (!getToken()) return;
    authApi.getMe()
      .then((res) => setUser(res.data))
      .catch((err) => {
        if (err?.response?.status === 401) {
          setUser(null);
          // 토큰 삭제 및 리다이렉트는 client.ts의 401 인터셉터가 처리
        }
        // 네트워크 오류 등 401이 아닌 경우에는 토큰을 유지
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsPending(true);
    setError(null);
    try {
      const res = await authApi.login(email, password);
      setToken(res.data.token);
      setUser(res.data.user);
      setTheme(res.data.user.themeMode);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('로그인에 실패했습니다.'));
      throw err;
    } finally {
      setIsPending(false);
    }
  }, [navigate, setTheme]);

  const register = useCallback(async (email: string, password: string, name: string) => {
    setIsPending(true);
    setError(null);
    try {
      const res = await authApi.register(email, password, name);
      setToken(res.data.token);
      setUser(res.data.user);
      setTheme(res.data.user.themeMode);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('회원가입에 실패했습니다.'));
      throw err;
    } finally {
      setIsPending(false);
    }
  }, [navigate, setTheme]);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    navigate('/login');
  }, [navigate]);

  const updateProfile = useCallback(async (data: UpdateMeData) => {
    setIsPending(true);
    setError(null);
    try {
      const res = await authApi.updateMe(data);
      setUser(res.data);
      if (data.themeMode) {
        setTheme(data.themeMode);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('프로필 업데이트에 실패했습니다.'));
      throw err;
    } finally {
      setIsPending(false);
    }
  }, [setTheme]);

  const deleteAccount = useCallback(async () => {
    setIsPending(true);
    setError(null);
    try {
      await authApi.deleteMe();
      clearToken();
      setUser(null);
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('계정 삭제에 실패했습니다.'));
      throw err;
    } finally {
      setIsPending(false);
    }
  }, [navigate]);

  return {
    isAuthenticated,
    user,
    isPending,
    error,
    login,
    register,
    logout,
    updateProfile,
    deleteAccount,
  };
}
