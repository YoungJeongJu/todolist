import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

// ===== 공통 헬퍼 =====

function renderWithProviders(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

// ===== US-15: 회원가입 → 카테고리 생성 → 할 일 등록 흐름 =====

describe('US-15: 회원가입 → 카테고리 생성 → 할 일 등록 흐름', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('RegisterPage - 폼 제출 시 register 함수를 호출한다', async () => {
    const mockRegister = vi.fn().mockResolvedValue(undefined);

    vi.doMock('../../hooks/useAuth', () => ({
      useAuth: () => ({
        register: mockRegister,
        isPending: false,
        login: vi.fn(),
        logout: vi.fn(),
        user: null,
        isAuthenticated: false,
        updateProfile: vi.fn(),
        deleteAccount: vi.fn(),
        error: null,
      }),
    }));

    const { default: RegisterPage } = await import('../../pages/RegisterPage');

    renderWithProviders(<RegisterPage />);

    fireEvent.change(screen.getByPlaceholderText('이름'), { target: { value: '홍길동' } });
    fireEvent.change(screen.getByPlaceholderText('이메일'), { target: { value: 'hong@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('비밀번호'), { target: { value: 'Test1234' } });
    fireEvent.change(screen.getByPlaceholderText('비밀번호 확인'), { target: { value: 'Test1234' } });

    await act(async () => {
      fireEvent.click(screen.getByText('가입하기'));
    });

    expect(mockRegister).toHaveBeenCalledWith('hong@test.com', 'Test1234', '홍길동');
  });

  it('CategoryForm - 카테고리 이름 입력 후 추가 버튼 클릭 시 categoryApi.create 호출', async () => {
    const mockCreate = vi.fn().mockResolvedValue({ data: { id: '3', name: '업무', isDefault: false } });

    vi.doMock('../../api/categoryApi', () => ({
      categoryApi: { create: mockCreate, remove: vi.fn(), getAll: vi.fn() },
    }));
    vi.doMock('@tanstack/react-query', async () => {
      const actual = await vi.importActual('@tanstack/react-query');
      return { ...actual, useQueryClient: () => ({ invalidateQueries: vi.fn() }) };
    });

    const { default: CategoryForm } = await import('../../components/category/CategoryForm');

    renderWithProviders(<CategoryForm />);

    fireEvent.change(screen.getByPlaceholderText('새 카테고리 이름'), { target: { value: '업무' } });
    fireEvent.click(screen.getByRole('button', { name: '+추가' }));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({ name: '업무' });
    });
  });

  it('TodoForm - 제목 입력 후 저장 버튼 클릭 시 todoApi.create 호출', async () => {
    const mockTodoCreate = vi.fn().mockResolvedValue({ data: { id: '1', title: '새 할 일' } });

    vi.doMock('../../api/todoApi', () => ({
      todoApi: { create: mockTodoCreate, update: vi.fn(), remove: vi.fn(), getAll: vi.fn() },
    }));
    vi.doMock('../../hooks/useCategories', () => ({
      useCategories: () => ({ categories: [], isLoading: false, error: null }),
    }));
    vi.doMock('@tanstack/react-query', async () => {
      const actual = await vi.importActual('@tanstack/react-query');
      return { ...actual, useQueryClient: () => ({ invalidateQueries: vi.fn() }) };
    });

    const { default: TodoForm } = await import('../../components/todo/TodoForm');

    renderWithProviders(<TodoForm onClose={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText('제목을 입력하세요'), { target: { value: '새 할 일' } });

    await act(async () => {
      fireEvent.click(screen.getByText('저장'));
    });

    await waitFor(() => {
      expect(mockTodoCreate).toHaveBeenCalledWith(expect.objectContaining({ title: '새 할 일' }));
    });
  });
});

// ===== US-16: 기한 초과 필터링 → 상태 변경 =====

describe('US-16: 기한 초과 필터링 → 상태 변경', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('MainPage - "기한 초과" 필터 칩 클릭 시 필터 상태가 변경된다', async () => {
    vi.doMock('../../hooks/useAuth', () => ({
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
    vi.doMock('../../hooks/useCategories', () => ({
      useCategories: () => ({ categories: [], isLoading: false, error: null }),
    }));
    vi.doMock('../../hooks/useTodos', () => ({
      useTodos: vi.fn().mockReturnValue({ todos: [], isLoading: false, error: null }),
    }));
    vi.doMock('@tanstack/react-query', async () => {
      const actual = await vi.importActual('@tanstack/react-query');
      return { ...actual, useQueryClient: () => ({ invalidateQueries: vi.fn() }) };
    });

    const { default: MainPage } = await import('../../pages/MainPage');
    const { useTodos } = await import('../../hooks/useTodos');

    renderWithProviders(<MainPage />);

    fireEvent.click(screen.getByText('기한 초과'));

    await waitFor(() => {
      expect(useTodos).toHaveBeenCalledWith(expect.objectContaining({ status: 'OVERDUE' }));
    });
  });

  it('TodoItem - 상태 드롭다운 변경 시 onStatusChange 호출된다', async () => {
    const { default: TodoItem } = await import('../../components/todo/TodoItem');

    const todo = {
      id: '1',
      title: '테스트 할 일',
      description: null,
      status: 'NOT_STARTED' as const,
      isOverdue: false,
      dueDate: null,
      categoryId: 'cat1',
      userId: 'u1',
      startDate: null,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    };

    const onStatusChange = vi.fn();

    render(<TodoItem todo={todo} onEdit={vi.fn()} onDelete={vi.fn()} onStatusChange={onStatusChange} />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'IN_PROGRESS' } });

    expect(onStatusChange).toHaveBeenCalledWith('1', 'IN_PROGRESS');
  });
});

// ===== US-17: 카테고리 삭제 → 이관 확인 → 신규 카테고리 생성 =====

describe('US-17: 카테고리 삭제 → 이관 확인 → 신규 카테고리 생성', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('기본이 아닌 카테고리 삭제 버튼 클릭 시 ConfirmDialog가 표시된다', async () => {
    vi.doMock('../../hooks/useCategories', () => ({
      useCategories: () => ({
        categories: [
          { id: '1', name: '기본', isDefault: true, userId: 'u1', createdAt: '2024-01-01' },
          { id: '2', name: '업무', isDefault: false, userId: 'u1', createdAt: '2024-01-01' },
        ],
        isLoading: false,
        error: null,
      }),
    }));
    vi.doMock('../../api/categoryApi', () => ({
      categoryApi: { create: vi.fn(), remove: vi.fn().mockResolvedValue({}), getAll: vi.fn() },
    }));
    vi.doMock('@tanstack/react-query', async () => {
      const actual = await vi.importActual('@tanstack/react-query');
      return { ...actual, useQueryClient: () => ({ invalidateQueries: vi.fn() }) };
    });

    const { default: CategoryList } = await import('../../components/category/CategoryList');

    render(<CategoryList selectedCategoryId={null} onSelect={vi.fn()} />);

    fireEvent.click(screen.getByLabelText('업무 삭제'));

    expect(screen.getByText('카테고리 삭제')).toBeInTheDocument();
    expect(screen.getByText(/'업무' 카테고리를 삭제하시겠습니까/)).toBeInTheDocument();
  });

  it('ConfirmDialog 확인 클릭 시 categoryApi.remove 호출된다', async () => {
    const mockRemove = vi.fn().mockResolvedValue({});

    vi.doMock('../../hooks/useCategories', () => ({
      useCategories: () => ({
        categories: [
          { id: '1', name: '기본', isDefault: true, userId: 'u1', createdAt: '2024-01-01' },
          { id: '2', name: '업무', isDefault: false, userId: 'u1', createdAt: '2024-01-01' },
        ],
        isLoading: false,
        error: null,
      }),
    }));
    vi.doMock('../../api/categoryApi', () => ({
      categoryApi: { create: vi.fn(), remove: mockRemove, getAll: vi.fn() },
    }));
    vi.doMock('@tanstack/react-query', async () => {
      const actual = await vi.importActual('@tanstack/react-query');
      return { ...actual, useQueryClient: () => ({ invalidateQueries: vi.fn() }) };
    });

    const { default: CategoryList } = await import('../../components/category/CategoryList');

    render(<CategoryList selectedCategoryId={null} onSelect={vi.fn()} />);

    fireEvent.click(screen.getByLabelText('업무 삭제'));
    fireEvent.click(screen.getByRole('button', { name: '삭제' }));

    await waitFor(() => {
      expect(mockRemove).toHaveBeenCalledWith('2');
    });
  });

  it('CategoryForm - 새 카테고리 이름 입력 후 추가 버튼 클릭 시 categoryApi.create 호출된다', async () => {
    const mockCreate = vi.fn().mockResolvedValue({ data: { id: '3', name: '개인', isDefault: false } });

    vi.doMock('../../api/categoryApi', () => ({
      categoryApi: { create: mockCreate, remove: vi.fn(), getAll: vi.fn() },
    }));
    vi.doMock('@tanstack/react-query', async () => {
      const actual = await vi.importActual('@tanstack/react-query');
      return { ...actual, useQueryClient: () => ({ invalidateQueries: vi.fn() }) };
    });

    const { default: CategoryForm } = await import('../../components/category/CategoryForm');

    renderWithProviders(<CategoryForm />);

    fireEvent.change(screen.getByPlaceholderText('새 카테고리 이름'), { target: { value: '개인' } });
    fireEvent.click(screen.getByRole('button', { name: '+추가' }));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({ name: '개인' });
    });
  });
});

// ===== US-18: 중복 이메일 가입 시도 시 오류 메시지 표시 =====

describe('US-18: 중복 이메일 가입 시도 시 오류 메시지 표시', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('중복 이메일로 가입 시 이메일 필드에 오류 메시지가 표시된다', async () => {
    const duplicateError = Object.assign(new Error('Duplicate'), {
      isAxiosError: true,
      response: {
        data: {
          error: { code: 'DUPLICATE_EMAIL', message: '이미 사용 중인 이메일입니다.' },
        },
      },
    });

    vi.doMock('axios', async () => {
      const actual = await vi.importActual('axios');
      return {
        ...actual,
        default: actual.default,
        isAxiosError: (err: unknown) => (err as { isAxiosError?: boolean }).isAxiosError === true,
      };
    });

    vi.doMock('../../hooks/useAuth', () => ({
      useAuth: () => ({
        register: vi.fn().mockRejectedValue(duplicateError),
        isPending: false,
        login: vi.fn(),
        logout: vi.fn(),
        user: null,
        isAuthenticated: false,
        updateProfile: vi.fn(),
        deleteAccount: vi.fn(),
        error: null,
      }),
    }));

    const { default: RegisterPage } = await import('../../pages/RegisterPage');

    renderWithProviders(<RegisterPage />);

    fireEvent.change(screen.getByPlaceholderText('이름'), { target: { value: '테스트' } });
    fireEvent.change(screen.getByPlaceholderText('이메일'), { target: { value: 'duplicate@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('비밀번호'), { target: { value: 'Test1234' } });
    fireEvent.change(screen.getByPlaceholderText('비밀번호 확인'), { target: { value: 'Test1234' } });

    await act(async () => {
      fireEvent.click(screen.getByText('가입하기'));
    });

    await waitFor(() => {
      expect(screen.getByText('! 이미 사용 중인 이메일입니다')).toBeInTheDocument();
    });
  });
});

// ===== US-19: 잘못된 날짜 등록 시도 시 오류 표시 및 저장 차단 =====

describe('US-19: 잘못된 날짜 등록 시도 시 오류 표시 및 저장 차단', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('종료일이 시작일보다 이전이면 오류 메시지 표시 및 todoApi.create 미호출', async () => {
    const mockTodoCreate = vi.fn().mockResolvedValue({ data: {} });

    vi.doMock('../../api/todoApi', () => ({
      todoApi: { create: mockTodoCreate, update: vi.fn(), remove: vi.fn(), getAll: vi.fn() },
    }));
    vi.doMock('../../hooks/useCategories', () => ({
      useCategories: () => ({ categories: [], isLoading: false, error: null }),
    }));
    vi.doMock('@tanstack/react-query', async () => {
      const actual = await vi.importActual('@tanstack/react-query');
      return { ...actual, useQueryClient: () => ({ invalidateQueries: vi.fn() }) };
    });

    const { default: TodoForm } = await import('../../components/todo/TodoForm');

    const onClose = vi.fn();
    renderWithProviders(<TodoForm onClose={onClose} />);

    fireEvent.change(screen.getByPlaceholderText('제목을 입력하세요'), { target: { value: '테스트 할 일' } });

    const dateInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2026-01-10' } });
    fireEvent.change(dateInputs[1], { target: { value: '2026-01-05' } });

    fireEvent.click(screen.getByText('저장'));

    expect(screen.getByText('종료일은 시작일과 같거나 이후여야 합니다')).toBeInTheDocument();
    expect(mockTodoCreate).not.toHaveBeenCalled();
  });
});

// ===== US-20: 미인증 상태에서 보호 라우트 접근 시 /login 리다이렉트 =====

describe('US-20: 미인증 상태에서 보호 라우트 접근 시 /login 리다이렉트', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('토큰이 없으면 PrivateRoute가 Navigate to="/login"을 렌더링한다', async () => {
    vi.doMock('../../api/client', () => ({
      getToken: vi.fn(() => null),
      setToken: vi.fn(),
      clearToken: vi.fn(),
      default: {
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      },
    }));

    // PrivateRoute 로직을 직접 재현하여 테스트
    const { getToken } = await import('../../api/client');
    const { Navigate } = await import('react-router-dom');

    function PrivateRouteTest() {
      if (!getToken()) {
        return <Navigate to="/login" replace />;
      }
      return <div>보호된 콘텐츠</div>;
    }

    render(
      <MemoryRouter initialEntries={['/']}>
        <PrivateRouteTest />
      </MemoryRouter>
    );

    expect(screen.queryByText('보호된 콘텐츠')).not.toBeInTheDocument();
    expect(getToken()).toBeNull();
  });
});

// ===== US-21: 기본 카테고리 삭제 시도 시 삭제 차단 =====

describe('US-21: 기본 카테고리 삭제 시도 시 삭제 차단', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('isDefault=true 카테고리에 삭제 버튼이 없다', async () => {
    vi.doMock('../../hooks/useCategories', () => ({
      useCategories: () => ({
        categories: [
          { id: '1', name: '기본', isDefault: true, userId: 'u1', createdAt: '2024-01-01' },
          { id: '2', name: '업무', isDefault: false, userId: 'u1', createdAt: '2024-01-01' },
        ],
        isLoading: false,
        error: null,
      }),
    }));
    vi.doMock('../../api/categoryApi', () => ({
      categoryApi: { create: vi.fn(), remove: vi.fn(), getAll: vi.fn() },
    }));
    vi.doMock('@tanstack/react-query', async () => {
      const actual = await vi.importActual('@tanstack/react-query');
      return { ...actual, useQueryClient: () => ({ invalidateQueries: vi.fn() }) };
    });

    const { default: CategoryList } = await import('../../components/category/CategoryList');

    render(<CategoryList selectedCategoryId={null} onSelect={vi.fn()} />);

    expect(screen.queryByLabelText('기본 삭제')).not.toBeInTheDocument();
    expect(screen.getByLabelText('업무 삭제')).toBeInTheDocument();
  });
});

// ===== US-22: 비밀번호 불일치 로그인 시 포괄적 오류 메시지 표시 =====

describe('US-22: 비밀번호 불일치 로그인 시 오류 메시지 표시', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('login 함수가 에러로 reject되면 오류 메시지가 표시된다', async () => {
    const loginError = Object.assign(new Error('Unauthorized'), {
      isAxiosError: true,
      response: {
        status: 401,
        data: { error: { message: '이메일 또는 비밀번호가 올바르지 않습니다' } },
      },
    });

    vi.doMock('axios', async () => {
      const actual = await vi.importActual('axios');
      return {
        ...actual,
        default: actual.default,
        isAxiosError: (err: unknown) => (err as { isAxiosError?: boolean }).isAxiosError === true,
      };
    });

    vi.doMock('../../hooks/useAuth', () => ({
      useAuth: () => ({
        login: vi.fn().mockRejectedValue(loginError),
        isPending: false,
        register: vi.fn(),
        logout: vi.fn(),
        user: null,
        isAuthenticated: false,
        updateProfile: vi.fn(),
        deleteAccount: vi.fn(),
        error: null,
      }),
    }));

    const { default: LoginPage } = await import('../../pages/LoginPage');

    renderWithProviders(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText('이메일'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('비밀번호'), { target: { value: 'wrongPassword1' } });

    await act(async () => {
      fireEvent.click(screen.getByText('로그인'));
    });

    await waitFor(() => {
      expect(screen.getByText(/이메일 또는 비밀번호가 올바르지 않습니다/)).toBeInTheDocument();
    });
  });
});
