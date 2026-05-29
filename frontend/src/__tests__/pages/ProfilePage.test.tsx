import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProfilePage from '../../pages/ProfilePage';

const mockUpdateProfile = vi.fn();
const mockDeleteAccount = vi.fn();
const mockLogout = vi.fn();

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: '1', email: 'test@example.com', name: '테스트', themeMode: 'LIGHT' },
    isPending: false,
    error: null,
    isAuthenticated: true,
    login: vi.fn(),
    register: vi.fn(),
    logout: mockLogout,
    updateProfile: mockUpdateProfile,
    deleteAccount: mockDeleteAccount,
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

function renderProfilePage() {
  return render(
    <MemoryRouter>
      <ProfilePage />
    </MemoryRouter>
  );
}

describe('ProfilePage', () => {
  beforeEach(() => {
    mockUpdateProfile.mockReset();
    mockDeleteAccount.mockReset();
    mockLogout.mockReset();
  });

  it('이메일이 읽기 전용으로 표시된다', () => {
    renderProfilePage();
    const emailInput = screen.getByDisplayValue('test@example.com');
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('readonly');
  });

  it('현재 사용자 이름이 이름 필드 초기값으로 설정된다', () => {
    renderProfilePage();
    expect(screen.getByDisplayValue('테스트')).toBeInTheDocument();
  });

  it('이름 저장 버튼 클릭 시 updateProfile을 호출한다', async () => {
    mockUpdateProfile.mockResolvedValue(undefined);
    renderProfilePage();

    const nameInput = screen.getByPlaceholderText('새 이름 (1~50자)');
    fireEvent.change(nameInput, { target: { value: '새이름' } });
    fireEvent.click(screen.getByRole('button', { name: '이름 저장' }));

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({ name: '새이름' });
    });
  });

  it('이름이 빈 값이면 오류 메시지를 표시하고 updateProfile을 호출하지 않는다', async () => {
    renderProfilePage();

    const nameInput = screen.getByPlaceholderText('새 이름 (1~50자)');
    fireEvent.change(nameInput, { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: '이름 저장' }));

    await waitFor(() => {
      expect(screen.getByText('! 이름은 1자 이상 50자 이하여야 합니다')).toBeInTheDocument();
    });
    expect(mockUpdateProfile).not.toHaveBeenCalled();
  });

  it('회원 탈퇴 버튼 클릭 시 확인 다이얼로그가 표시된다', () => {
    renderProfilePage();

    fireEvent.click(screen.getByRole('button', { name: '회원 탈퇴' }));

    expect(screen.getByText('정말 탈퇴하시겠습니까?')).toBeInTheDocument();
    expect(screen.getByText('모든 할 일과 카테고리가 영구 삭제됩니다.')).toBeInTheDocument();
  });

  it('탈퇴 확인 클릭 시 deleteAccount를 호출한다', async () => {
    mockDeleteAccount.mockResolvedValue(undefined);
    renderProfilePage();

    fireEvent.click(screen.getByRole('button', { name: '회원 탈퇴' }));
    fireEvent.click(screen.getByRole('button', { name: '탈퇴 확인' }));

    await waitFor(() => {
      expect(mockDeleteAccount).toHaveBeenCalled();
    });
  });

  it('취소 클릭 시 다이얼로그가 닫히고 deleteAccount를 호출하지 않는다', async () => {
    renderProfilePage();

    fireEvent.click(screen.getByRole('button', { name: '회원 탈퇴' }));
    expect(screen.getByText('정말 탈퇴하시겠습니까?')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '취소' }));

    await waitFor(() => {
      expect(screen.queryByText('정말 탈퇴하시겠습니까?')).not.toBeInTheDocument();
    });
    expect(mockDeleteAccount).not.toHaveBeenCalled();
  });

  it('로그아웃 버튼 클릭 시 logout을 호출한다', () => {
    renderProfilePage();

    fireEvent.click(screen.getByRole('button', { name: '로그아웃' }));

    expect(mockLogout).toHaveBeenCalled();
  });
});
