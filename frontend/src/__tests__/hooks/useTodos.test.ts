import { describe, it, expect, vi, beforeEach, type MockInstance } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useTodos } from '../../hooks/useTodos';
import { todoApi } from '../../api/todoApi';

vi.mock('../../api/todoApi', () => ({
  todoApi: {
    getAll: vi.fn(),
  },
}));

const mockTodoApi = todoApi as unknown as { getAll: MockInstance };

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useTodos', () => {
  it('todos 배열을 반환한다', async () => {
    const mockTodos = [
      {
        id: '1',
        title: '테스트 할 일',
        description: null,
        status: 'NOT_STARTED',
        startDate: null,
        dueDate: null,
        categoryId: 'cat-1',
        userId: 'user-1',
        isOverdue: false,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    ];
    mockTodoApi.getAll.mockResolvedValueOnce({ data: mockTodos });

    const { result } = renderHook(() => useTodos(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.todos).toEqual(mockTodos);
  });

  it('filters 파라미터가 todoApi.getAll에 전달된다', async () => {
    mockTodoApi.getAll.mockResolvedValueOnce({ data: [] });
    const filters = { status: 'DONE' as const };

    renderHook(() => useTodos(filters), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(mockTodoApi.getAll).toHaveBeenCalledWith(filters);
    });
  });
});
