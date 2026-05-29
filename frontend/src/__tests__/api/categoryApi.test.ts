import { describe, it, expect, vi, beforeEach, type MockInstance } from 'vitest';
import { categoryApi } from '../../api/categoryApi';
import client from '../../api/client';

vi.mock('../../api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockClient = client as unknown as {
  get: MockInstance;
  post: MockInstance;
  delete: MockInstance;
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('categoryApi', () => {
  it('getAll(): GET /categories 요청을 보낸다', async () => {
    mockClient.get.mockResolvedValueOnce({ data: [] });
    await categoryApi.getAll();
    expect(mockClient.get).toHaveBeenCalledWith('/categories');
  });

  it('create({ name: "업무" }): POST /categories 요청을 보낸다', async () => {
    mockClient.post.mockResolvedValueOnce({ data: {} });
    await categoryApi.create({ name: '업무' });
    expect(mockClient.post).toHaveBeenCalledWith('/categories', { name: '업무' });
  });

  it('remove(id): DELETE /categories/:id 요청을 보낸다', async () => {
    mockClient.delete.mockResolvedValueOnce({ data: undefined });
    await categoryApi.remove('cat-1');
    expect(mockClient.delete).toHaveBeenCalledWith('/categories/cat-1');
  });
});
