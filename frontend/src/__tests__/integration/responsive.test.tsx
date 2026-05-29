import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// index.css 파일 내용을 직접 읽어서 검사
const cssPath = resolve(__dirname, '../../index.css');
const cssContent = readFileSync(cssPath, 'utf-8');

function renderWithProviders(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('반응형 UI 검증', () => {
  it('index.css에 @media (max-width: 767px) 규칙이 정의되어 있다', () => {
    expect(cssContent).toContain('@media (max-width: 767px)');
  });

  it('.app-layout에 grid 레이아웃 규칙이 있다', () => {
    expect(cssContent).toContain('.app-layout');
    expect(cssContent).toContain('display: grid');
  });

  it('@media (max-width: 767px) 블록 안에 .app-layout 반응형 규칙이 있다', () => {
    // 미디어 쿼리 블록 이후에 app-layout이 재정의되는지 확인
    const mediaIndex = cssContent.indexOf('@media (max-width: 767px)');
    const afterMedia = cssContent.slice(mediaIndex);
    expect(afterMedia).toContain('.app-layout');
  });

  it('@media (max-width: 767px) 블록 안에 .mobile-category-select 규칙이 있다', () => {
    const mediaIndex = cssContent.indexOf('@media (max-width: 767px)');
    const afterMedia = cssContent.slice(mediaIndex);
    expect(afterMedia).toContain('.mobile-category-select');
  });

  it('.mobile-category-select는 기본적으로 display: none이다', () => {
    const beforeMedia = cssContent.slice(0, cssContent.indexOf('@media (max-width: 767px)'));
    expect(beforeMedia).toContain('.mobile-category-select');
    expect(beforeMedia).toContain('display: none');
  });

  it('@media (max-width: 767px)에서 .mobile-category-select가 display: block이다', () => {
    const mediaIndex = cssContent.indexOf('@media (max-width: 767px)');
    const afterMedia = cssContent.slice(mediaIndex);
    expect(afterMedia).toContain('display: block');
  });

  describe('MainPage 컴포넌트 구조', () => {
    beforeEach(() => {
      vi.resetModules();
    });

    it('MainPage가 app-layout 클래스를 가진 요소를 렌더링한다', async () => {
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

      renderWithProviders(<MainPage />);

      const appLayout = document.querySelector('.app-layout');
      expect(appLayout).toBeInTheDocument();
    });

    it('MainPage가 mobile-category-select 클래스를 가진 요소를 렌더링한다', async () => {
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

      renderWithProviders(<MainPage />);

      const mobileSelect = document.querySelector('.mobile-category-select');
      expect(mobileSelect).toBeInTheDocument();
    });
  });
});
