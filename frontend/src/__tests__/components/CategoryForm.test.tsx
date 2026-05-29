import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CategoryForm from '../../components/category/CategoryForm';

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

describe('CategoryForm', () => {
  it('입력 필드와 추가 버튼이 렌더링된다', () => {
    render(<CategoryForm />);
    expect(screen.getByPlaceholderText('새 카테고리 이름')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '+추가' })).toBeInTheDocument();
  });

  it('30자 초과 입력 시 오류 메시지를 표시하고 API를 호출하지 않는다', async () => {
    render(<CategoryForm />);
    const input = screen.getByPlaceholderText('새 카테고리 이름');
    const button = screen.getByRole('button', { name: '+추가' });

    fireEvent.change(input, { target: { value: 'a'.repeat(31) } });
    fireEvent.click(button);

    expect(screen.getByText('카테고리 이름은 30자 이하여야 합니다')).toBeInTheDocument();
    expect(categoryApi.create).not.toHaveBeenCalled();
  });

  it('유효한 이름 입력 후 버튼 클릭 시 categoryApi.create를 호출한다', async () => {
    render(<CategoryForm />);
    const input = screen.getByPlaceholderText('새 카테고리 이름');
    const button = screen.getByRole('button', { name: '+추가' });

    fireEvent.change(input, { target: { value: '업무' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(categoryApi.create).toHaveBeenCalledWith({ name: '업무' });
    });
  });

  it('API 호출 성공 후 입력창이 초기화된다', async () => {
    render(<CategoryForm />);
    const input = screen.getByPlaceholderText('새 카테고리 이름') as HTMLInputElement;
    const button = screen.getByRole('button', { name: '+추가' });

    fireEvent.change(input, { target: { value: '업무' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });
});
