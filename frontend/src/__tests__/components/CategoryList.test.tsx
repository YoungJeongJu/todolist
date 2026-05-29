import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CategoryList from '../../components/category/CategoryList';

vi.mock('../../hooks/useCategories', () => ({
  useCategories: () => ({
    categories: [
      { id: '1', name: '기본', isDefault: true, userId: 'u1', createdAt: '2024-01-01' },
      { id: '2', name: '업무', isDefault: false, userId: 'u1', createdAt: '2024-01-01' },
    ],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
    defaultCategory: { id: '1', name: '기본', isDefault: true, userId: 'u1', createdAt: '2024-01-01' },
  }),
}));

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return { ...actual, useQueryClient: () => ({ invalidateQueries: vi.fn() }) };
});

vi.mock('../../api/categoryApi', () => ({
  categoryApi: {
    create: vi.fn().mockResolvedValue({ data: { id: '3', name: '새카테고리', isDefault: false } }),
    remove: vi.fn().mockResolvedValue({}),
    getAll: vi.fn().mockResolvedValue({ data: [] }),
  },
}));

import { categoryApi } from '../../api/categoryApi';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CategoryList', () => {
  it('카테고리 목록을 렌더링한다', () => {
    render(<CategoryList selectedCategoryId={null} onSelect={vi.fn()} />);
    expect(screen.getByText('기본')).toBeInTheDocument();
    expect(screen.getByText('업무')).toBeInTheDocument();
  });

  it('"전체" 항목을 렌더링한다', () => {
    render(<CategoryList selectedCategoryId={null} onSelect={vi.fn()} />);
    expect(screen.getByText('전체')).toBeInTheDocument();
  });

  it('isDefault=true 카테고리에는 삭제 버튼이 없다', () => {
    render(<CategoryList selectedCategoryId={null} onSelect={vi.fn()} />);
    const deleteButtons = screen.queryAllByLabelText('기본 삭제');
    expect(deleteButtons).toHaveLength(0);
  });

  it('isDefault=false 카테고리에는 삭제 버튼이 있다', () => {
    render(<CategoryList selectedCategoryId={null} onSelect={vi.fn()} />);
    expect(screen.getByLabelText('업무 삭제')).toBeInTheDocument();
  });

  it('삭제 버튼 클릭 시 확인 다이얼로그가 표시된다', () => {
    render(<CategoryList selectedCategoryId={null} onSelect={vi.fn()} />);
    const deleteButton = screen.getByLabelText('업무 삭제');
    fireEvent.click(deleteButton);
    expect(screen.getByText('카테고리 삭제')).toBeInTheDocument();
  });

  it('삭제 확인 시 categoryApi.remove를 호출한다', async () => {
    render(<CategoryList selectedCategoryId={null} onSelect={vi.fn()} />);
    const deleteButton = screen.getByLabelText('업무 삭제');
    fireEvent.click(deleteButton);

    const confirmButton = screen.getByRole('button', { name: '삭제' });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(categoryApi.remove).toHaveBeenCalledWith('2');
    });
  });
});
