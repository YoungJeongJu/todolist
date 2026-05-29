import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TodoItem from '../../components/todo/TodoItem';
import type { Todo } from '../../types';

const baseTodo: Todo = {
  id: '1',
  title: '테스트 할 일',
  description: null,
  status: 'NOT_STARTED',
  isOverdue: false,
  dueDate: null,
  categoryId: 'cat1',
  userId: 'u1',
  startDate: null,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('TodoItem', () => {
  it('제목을 렌더링한다', () => {
    render(
      <TodoItem
        todo={baseTodo}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onStatusChange={vi.fn()}
      />
    );
    expect(screen.getByText('테스트 할 일')).toBeInTheDocument();
  });

  it('완료 상태(DONE)에서 취소선 클래스를 적용한다', () => {
    const doneTodo: Todo = { ...baseTodo, status: 'DONE' };
    render(
      <TodoItem
        todo={doneTodo}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onStatusChange={vi.fn()}
      />
    );
    const title = screen.getByText('테스트 할 일');
    expect(title).toHaveClass('todo-card__title--done');
  });

  it('isOverdue=true이고 status가 DONE이 아닐 때 기한 초과 날짜 스타일을 적용한다', () => {
    const overdueTodo: Todo = { ...baseTodo, isOverdue: true, dueDate: '2024-01-15' };
    render(
      <TodoItem
        todo={overdueTodo}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onStatusChange={vi.fn()}
      />
    );
    const dateEl = screen.getByText('~1/15');
    expect(dateEl).toHaveClass('todo-card__date--overdue');
  });

  it('상태 변경 시 onStatusChange를 호출한다', () => {
    const onStatusChange = vi.fn();
    render(
      <TodoItem
        todo={baseTodo}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onStatusChange={onStatusChange}
      />
    );
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'IN_PROGRESS' } });
    expect(onStatusChange).toHaveBeenCalledWith('1', 'IN_PROGRESS');
  });

  it('삭제 버튼 클릭 시 onDelete를 호출한다', () => {
    const onDelete = vi.fn();
    render(
      <TodoItem
        todo={baseTodo}
        onEdit={vi.fn()}
        onDelete={onDelete}
        onStatusChange={vi.fn()}
      />
    );
    const deleteButton = screen.getByLabelText('삭제');
    fireEvent.click(deleteButton);
    expect(onDelete).toHaveBeenCalledWith(baseTodo);
  });
});
