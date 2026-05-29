import { describe, it, expect, vi, beforeEach, type MockInstance } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useCategories } from '../../hooks/useCategories';
import { categoryApi } from '../../api/categoryApi';

vi.mock('../../api/categoryApi', () => ({
  categoryApi: {
    getAll: vi.fn(),
  },
}));

const mockCategoryApi = categoryApi as unknown as { getAll: MockInstance };

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

describe('useCategories', () => {
  it('categories 배열을 반환한다', async () => {
    const mockCategories = [
      { id: '1', name: '전체', isDefault: true, userId: 'user-1', createdAt: '2024-01-01' },
      { id: '2', name: '업무', isDefault: false, userId: 'user-1', createdAt: '2024-01-01' },
    ];
    mockCategoryApi.getAll.mockResolvedValueOnce({ data: mockCategories });

    const { result } = renderHook(() => useCategories(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.categories).toEqual(mockCategories);
  });

  it('defaultCategory는 isDefault=true인 항목을 반환한다', async () => {
    const defaultCat = { id: '1', name: '전체', isDefault: true, userId: 'user-1', createdAt: '2024-01-01' };
    const mockCategories = [
      defaultCat,
      { id: '2', name: '업무', isDefault: false, userId: 'user-1', createdAt: '2024-01-01' },
    ];
    mockCategoryApi.getAll.mockResolvedValueOnce({ data: mockCategories });

    const { result } = renderHook(() => useCategories(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.defaultCategory).toEqual(defaultCat);
  });
});
