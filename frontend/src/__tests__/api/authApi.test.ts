import { describe, it, expect, vi, beforeEach, type MockInstance } from 'vitest';
import { authApi } from '../../api/authApi';
import client from '../../api/client';

vi.mock('../../api/client', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockClient = client as unknown as {
  post: MockInstance;
  get: MockInstance;
  patch: MockInstance;
  delete: MockInstance;
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('authApi', () => {
  it('login: POST /auth/login 요청을 보낸다', async () => {
    mockClient.post.mockResolvedValueOnce({ data: { token: 'tok', user: {} } });
    await authApi.login('test@example.com', 'pass123');
    expect(mockClient.post).toHaveBeenCalledWith('/auth/login', {
      email: 'test@example.com',
      password: 'pass123',
    });
  });

  it('register: POST /auth/register 요청을 보낸다', async () => {
    mockClient.post.mockResolvedValueOnce({ data: { token: 'tok', user: {} } });
    await authApi.register('test@example.com', 'pass123', '홍길동');
    expect(mockClient.post).toHaveBeenCalledWith('/auth/register', {
      email: 'test@example.com',
      password: 'pass123',
      name: '홍길동',
    });
  });

  it('getMe: GET /auth/me 요청을 보낸다', async () => {
    mockClient.get.mockResolvedValueOnce({ data: {} });
    await authApi.getMe();
    expect(mockClient.get).toHaveBeenCalledWith('/auth/me');
  });

  it('updateMe: PATCH /auth/me 요청을 보낸다', async () => {
    mockClient.patch.mockResolvedValueOnce({ data: {} });
    const data = { name: '새이름' };
    await authApi.updateMe(data);
    expect(mockClient.patch).toHaveBeenCalledWith('/auth/me', data);
  });

  it('deleteMe: DELETE /auth/me 요청을 보낸다', async () => {
    mockClient.delete.mockResolvedValueOnce({ data: undefined });
    await authApi.deleteMe();
    expect(mockClient.delete).toHaveBeenCalledWith('/auth/me');
  });
});
