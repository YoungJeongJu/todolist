import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';

export default function ThemeToggle() {
  const { themeMode } = useTheme();
  const { updateProfile } = useAuth();

  const toggle = () => {
    const next = themeMode === 'LIGHT' ? 'DARK' : 'LIGHT';
    updateProfile({ themeMode: next });
  };

  return (
    <button
      type="button"
      className="btn-text"
      onClick={toggle}
      title={themeMode === 'LIGHT' ? '다크 모드로 전환' : '라이트 모드로 전환'}
      style={{ padding: 'var(--space-2)' }}
    >
      {themeMode === 'LIGHT' ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
