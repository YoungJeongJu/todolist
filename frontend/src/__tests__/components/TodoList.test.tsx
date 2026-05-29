import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import TodoList from '../../components/todo/TodoList';

vi.mock('../../hooks/useTodos', () => ({
  useTodos: vi.fn(() => ({
    todos: [
      {
        id: '1',
        title: '테스트 할 일',
        status: 'NOT_STARTED',
        isOverdue: false,
        dueDate: null,
        description: null,
        categoryId: 'cat1',
        userId: 'u1',
        startDate: null,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    ],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  })),
}));

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return { ...actual, useQueryClient: () => ({ invalidateQueries: vi.fn() }) };
});

vi.mock('../../api/todoApi', () => ({
  todoApi: {
    remove: vi.fn().mockResolvedValue({}),
    updateStatus: vi.fn().mockResolvedValue({}),
  },
}));

import { useTodos } from '../../hooks/useTodos';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('TodoList', () => {
  it('할 일 목록을 렌더링한다', () => {
    render(<TodoList filters={{}} onEdit={vi.fn()} />);
    expect(screen.getByText('테스트 할 일')).toBeInTheDocument();
  });

  it('빈 목록 시 빈 상태 메시지를 표시한다', () => {
    vi.mocked(useTodos).mockReturnValueOnce({
      todos: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    render(<TodoList filters={{}} onEdit={vi.fn()} />);
    expect(screen.getByText('해당 조건에 맞는 할 일이 없습니다.')).toBeInTheDocument();
  });

  it('로딩 중일 때 로딩 메시지를 표시한다', () => {
    vi.mocked(useTodos).mockReturnValueOnce({
      todos: [],
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    });
    render(<TodoList filters={{}} onEdit={vi.fn()} />);
    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });

  it('filters props가 useTodos에 전달된다', () => {
    const filters = { status: 'IN_PROGRESS' as const, categoryId: 'cat1' };
    render(<TodoList filters={filters} onEdit={vi.fn()} />);
    expect(vi.mocked(useTodos)).toHaveBeenCalledWith(filters);
  });
});
