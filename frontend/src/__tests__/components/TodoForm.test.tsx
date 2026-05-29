import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TodoForm from '../../components/todo/TodoForm';

vi.mock('../../api/todoApi', () => ({
  todoApi: {
    create: vi.fn().mockResolvedValue({
      data: {
        id: '1',
        title: '새 할 일',
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
    }),
    update: vi.fn().mockResolvedValue({
      data: {
        id: '1',
        title: '수정된 할 일',
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
    }),
    remove: vi.fn().mockResolvedValue({}),
    getAll: vi.fn().mockResolvedValue({ data: [] }),
    updateStatus: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('../../hooks/useCategories', () => ({
  useCategories: () => ({
    categories: [
      { id: 'cat1', name: '기본', isDefault: true, userId: 'u1', createdAt: '2024-01-01' },
    ],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
    defaultCategory: { id: 'cat1', name: '기본', isDefault: true, userId: 'u1', createdAt: '2024-01-01' },
  }),
}));

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return { ...actual, useQueryClient: () => ({ invalidateQueries: vi.fn() }) };
});

import { todoApi } from '../../api/todoApi';

function renderWithQuery(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

const mockTodo = {
  id: '1',
  title: '기존 할 일',
  description: '기존 설명',
  status: 'NOT_STARTED' as const,
  startDate: '2024-01-01',
  dueDate: '2024-01-10',
  categoryId: 'cat1',
  userId: 'u1',
  isOverdue: false,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('TodoForm', () => {
  it('등록 모드: 폼 필드가 렌더링된다', () => {
    renderWithQuery(<TodoForm onClose={vi.fn()} />);

    expect(screen.getByPlaceholderText('제목을 입력하세요')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('저장')).toBeInTheDocument();
    expect(screen.getByText('취소')).toBeInTheDocument();
    expect(screen.getByText('할 일 등록')).toBeInTheDocument();
  });

  it('수정 모드: 기존 값이 입력 필드에 미리 채워진다', () => {
    renderWithQuery(<TodoForm todo={mockTodo} onClose={vi.fn()} />);

    expect(screen.getByDisplayValue('기존 할 일')).toBeInTheDocument();
    expect(screen.getByDisplayValue('기존 설명')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-01-01')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-01-10')).toBeInTheDocument();
    expect(screen.getByText('할 일 수정')).toBeInTheDocument();
  });

  it('제목 미입력 시: 오류 메시지를 표시하고 API를 호출하지 않는다', async () => {
    renderWithQuery(<TodoForm onClose={vi.fn()} />);

    fireEvent.click(screen.getByText('저장'));

    await waitFor(() => {
      expect(screen.getByText('제목을 입력해 주세요')).toBeInTheDocument();
    });
    expect(todoApi.create).not.toHaveBeenCalled();
  });

  it('제목 100자 초과 시: 오류 메시지를 표시하고 API를 호출하지 않는다', async () => {
    renderWithQuery(<TodoForm onClose={vi.fn()} />);

    const titleInput = screen.getByPlaceholderText('제목을 입력하세요');
    fireEvent.change(titleInput, { target: { value: 'a'.repeat(101) } });
    fireEvent.click(screen.getByText('저장'));

    await waitFor(() => {
      expect(screen.getByText('제목은 100자 이하여야 합니다')).toBeInTheDocument();
    });
    expect(todoApi.create).not.toHaveBeenCalled();
  });

  it('dueDate < startDate 시: 날짜 오류 메시지를 표시하고 API를 호출하지 않는다', async () => {
    renderWithQuery(<TodoForm onClose={vi.fn()} />);

    const titleInput = screen.getByPlaceholderText('제목을 입력하세요');
    fireEvent.change(titleInput, { target: { value: '유효한 제목' } });

    const dateInputs = screen.getAllByDisplayValue('');
    const startDateInput = dateInputs.find((el) => (el as HTMLInputElement).type === 'date');
    // 시작일/종료일 input을 label로 찾기
    fireEvent.change(screen.getByLabelText ? screen.queryAllByRole('textbox')[0] ?? startDateInput! : startDateInput!, {});

    // getAllByRole이 없으므로 직접 input[type=date] 찾기
    const allInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(allInputs[0], { target: { value: '2024-01-10' } }); // 시작일
    fireEvent.change(allInputs[1], { target: { value: '2024-01-01' } }); // 종료일 < 시작일

    fireEvent.click(screen.getByText('저장'));

    await waitFor(() => {
      expect(screen.getByText('종료일은 시작일과 같거나 이후여야 합니다')).toBeInTheDocument();
    });
    expect(todoApi.create).not.toHaveBeenCalled();
  });

  it('유효한 제목 입력 후 저장: todoApi.create가 호출된다', async () => {
    const onClose = vi.fn();
    renderWithQuery(<TodoForm onClose={onClose} />);

    const titleInput = screen.getByPlaceholderText('제목을 입력하세요');
    fireEvent.change(titleInput, { target: { value: '새 할 일' } });
    fireEvent.click(screen.getByText('저장'));

    await waitFor(() => {
      expect(todoApi.create).toHaveBeenCalledWith(
        expect.objectContaining({ title: '새 할 일' })
      );
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('수정 모드에서 저장: todoApi.update가 호출된다', async () => {
    const onClose = vi.fn();
    renderWithQuery(<TodoForm todo={mockTodo} onClose={onClose} />);

    fireEvent.click(screen.getByText('저장'));

    await waitFor(() => {
      expect(todoApi.update).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({ title: '기존 할 일' })
      );
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('취소 버튼 클릭: onClose가 호출된다', () => {
    const onClose = vi.fn();
    renderWithQuery(<TodoForm onClose={onClose} />);

    fireEvent.click(screen.getByText('취소'));

    expect(onClose).toHaveBeenCalled();
  });
});
