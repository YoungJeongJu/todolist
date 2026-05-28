import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { useThemeStore } from './store/themeStore';
import router from './router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
  },
});

function ThemeApplier() {
  const themeMode = useThemeStore((s) => s.themeMode);

  useEffect(() => {
    document.documentElement.setAttribute(
      'data-theme',
      themeMode === 'DARK' ? 'dark' : 'light'
    );
  }, [themeMode]);

  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeApplier />
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
