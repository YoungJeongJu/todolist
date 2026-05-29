import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MainPage from '../../pages/MainPage';

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: '1', email: 'test@test.com', name: '테스트', themeMode: 'LIGHT' },
    isAuthenticated: true,
    logout: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    updateProfile: vi.fn(),
    deleteAccount: vi.fn(),
    isPending: false,
    error: null,
  }),
}));

vi.mock('../../hooks/useCategories', () => ({
  useCategories: () => ({
    categories: [],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
    defaultCategory: null,
  }),
}));

vi.mock('../../hooks/useTodos', () => ({
  useTodos: vi.fn(() => ({
    todos: [],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  })),
}));

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return { ...actual, useQueryClient: () => ({ invalidateQueries: vi.fn() }) };
});

vi.mock('../../api/categoryApi', () => ({
  categoryApi: {
    getAll: vi.fn().mockResolvedValue({ data: [] }),
    remove: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
      <a href={to}>{children}</a>
    ),
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('MainPage', () => {
  it('헤더에 TodoList 텍스트와 로그아웃 버튼을 렌더링한다', () => {
    render(
      <MemoryRouter>
        <MainPage />
      </MemoryRouter>
    );
    expect(screen.getByText('TodoList')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '로그아웃' })).toBeInTheDocument();
  });

  it('상태 필터 칩 5개를 렌더링한다', () => {
    render(
      <MemoryRouter>
        <MainPage />
      </MemoryRouter>
    );
    // "전체"는 모바일 드롭다운 option과 필터 칩 버튼에 중복으로 존재
    const allItems = screen.getAllByText('전체');
    expect(allItems.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('미시작')).toBeInTheDocument();
    expect(screen.getByText('진행 중')).toBeInTheDocument();
    expect(screen.getByText('완료')).toBeInTheDocument();
    expect(screen.getByText('기한 초과')).toBeInTheDocument();
  });

  it('필터 칩 클릭 시 active 상태가 변경된다', () => {
    render(
      <MemoryRouter>
        <MainPage />
      </MemoryRouter>
    );
    const inProgressChip = screen.getByText('진행 중');
    fireEvent.click(inProgressChip);
    expect(inProgressChip).toHaveClass('filter-chip--active');
  });

  it('FAB 버튼을 렌더링한다', () => {
    render(
      <MemoryRouter>
        <MainPage />
      </MemoryRouter>
    );
    expect(screen.getByLabelText('할 일 추가')).toBeInTheDocument();
  });
});
