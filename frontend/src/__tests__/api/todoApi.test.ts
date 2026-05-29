import { describe, it, expect, vi, beforeEach, type MockInstance } from 'vitest';
import { todoApi } from '../../api/todoApi';
import client from '../../api/client';

vi.mock('../../api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockClient = client as unknown as {
  get: MockInstance;
  post: MockInstance;
  patch: MockInstance;
  delete: MockInstance;
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('todoApi', () => {
  it('getAll(): GET /todos 요청을 보낸다', async () => {
    mockClient.get.mockResolvedValueOnce({ data: [] });
    await todoApi.getAll();
    expect(mockClient.get).toHaveBeenCalledWith('/todos', { params: {} });
  });

  it('getAll({ status: "DONE" }): GET /todos?status=DONE 요청을 보낸다', async () => {
    mockClient.get.mockResolvedValueOnce({ data: [] });
    await todoApi.getAll({ status: 'DONE' });
    expect(mockClient.get).toHaveBeenCalledWith('/todos', { params: { status: 'DONE' } });
  });

  it('getAll({ categoryId: "abc" }): GET /todos?categoryId=abc 요청을 보낸다', async () => {
    mockClient.get.mockResolvedValueOnce({ data: [] });
    await todoApi.getAll({ categoryId: 'abc' });
    expect(mockClient.get).toHaveBeenCalledWith('/todos', { params: { categoryId: 'abc' } });
  });

  it('create(data): POST /todos 요청을 보낸다', async () => {
    mockClient.post.mockResolvedValueOnce({ data: {} });
    const data = { title: '할 일 제목' };
    await todoApi.create(data);
    expect(mockClient.post).toHaveBeenCalledWith('/todos', data);
  });

  it('update(id, data): PATCH /todos/:id 요청을 보낸다', async () => {
    mockClient.patch.mockResolvedValueOnce({ data: {} });
    const data = { title: '수정된 제목' };
    await todoApi.update('todo-1', data);
    expect(mockClient.patch).toHaveBeenCalledWith('/todos/todo-1', data);
  });

  it('remove(id): DELETE /todos/:id 요청을 보낸다', async () => {
    mockClient.delete.mockResolvedValueOnce({ data: undefined });
    await todoApi.remove('todo-1');
    expect(mockClient.delete).toHaveBeenCalledWith('/todos/todo-1');
  });

  it('updateStatus(id, "DONE"): PATCH /todos/:id/status 요청을 보낸다', async () => {
    mockClient.patch.mockResolvedValueOnce({ data: {} });
    await todoApi.updateStatus('todo-1', 'DONE');
    expect(mockClient.patch).toHaveBeenCalledWith('/todos/todo-1/status', { status: 'DONE' });
  });
});
