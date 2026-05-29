import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from '../../pages/RegisterPage';

const mockRegister = vi.fn();

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    isPending: false,
    error: null,
    isAuthenticated: false,
    login: vi.fn(),
    register: mockRegister,
    logout: vi.fn(),
    updateProfile: vi.fn(),
    deleteAccount: vi.fn(),
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

function renderRegisterPage() {
  return render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>
  );
}

describe('RegisterPage', () => {
  beforeEach(() => {
    mockRegister.mockReset();
  });

  it('모든 입력 필드가 렌더링된다', () => {
    renderRegisterPage();
    expect(screen.getByPlaceholderText('이름')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('이메일')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('비밀번호')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('비밀번호 확인')).toBeInTheDocument();
  });

  it('가입하기 버튼이 렌더링된다', () => {
    renderRegisterPage();
    expect(screen.getByRole('button', { name: '가입하기' })).toBeInTheDocument();
  });

  it('로그인 링크가 존재한다', () => {
    renderRegisterPage();
    expect(screen.getByRole('link', { name: '로그인' })).toBeInTheDocument();
  });

  it('이름이 빈 값이면 유효성 오류 메시지를 표시한다', async () => {
    renderRegisterPage();

    fireEvent.change(screen.getByPlaceholderText('이메일'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('비밀번호'), {
      target: { value: 'password1' },
    });
    fireEvent.change(screen.getByPlaceholderText('비밀번호 확인'), {
      target: { value: 'password1' },
    });
    fireEvent.click(screen.getByRole('button', { name: '가입하기' }));

    await waitFor(() => {
      expect(screen.getByText('! 이름은 1자 이상 50자 이하여야 합니다')).toBeInTheDocument();
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('비밀번호가 일치하지 않으면 오류 메시지를 표시한다', async () => {
    renderRegisterPage();

    fireEvent.change(screen.getByPlaceholderText('이름'), {
      target: { value: '테스트' },
    });
    fireEvent.change(screen.getByPlaceholderText('이메일'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('비밀번호'), {
      target: { value: 'password1' },
    });
    fireEvent.change(screen.getByPlaceholderText('비밀번호 확인'), {
      target: { value: 'differentpw2' },
    });
    fireEvent.click(screen.getByRole('button', { name: '가입하기' }));

    await waitFor(() => {
      expect(screen.getByText('! 비밀번호가 일치하지 않습니다')).toBeInTheDocument();
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('비밀번호가 규칙에 맞지 않으면 오류 메시지를 표시한다', async () => {
    renderRegisterPage();

    fireEvent.change(screen.getByPlaceholderText('이름'), {
      target: { value: '테스트' },
    });
    fireEvent.change(screen.getByPlaceholderText('이메일'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('비밀번호'), {
      target: { value: 'short' },
    });
    fireEvent.change(screen.getByPlaceholderText('비밀번호 확인'), {
      target: { value: 'short' },
    });
    fireEvent.click(screen.getByRole('button', { name: '가입하기' }));

    await waitFor(() => {
      expect(screen.getByText('! 8자 이상, 영문과 숫자를 포함해야 합니다')).toBeInTheDocument();
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('유효성 통과 후 가입하기 클릭 시 register를 호출한다', async () => {
    mockRegister.mockResolvedValue(undefined);
    renderRegisterPage();

    fireEvent.change(screen.getByPlaceholderText('이름'), {
      target: { value: '테스트' },
    });
    fireEvent.change(screen.getByPlaceholderText('이메일'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('비밀번호'), {
      target: { value: 'password1' },
    });
    fireEvent.change(screen.getByPlaceholderText('비밀번호 확인'), {
      target: { value: 'password1' },
    });
    fireEvent.click(screen.getByRole('button', { name: '가입하기' }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('test@example.com', 'password1', '테스트');
    });
  });
});
