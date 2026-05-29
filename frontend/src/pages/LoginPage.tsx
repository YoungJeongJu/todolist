import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';

function getApiError(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.error?.message ?? fallback;
  }
  return fallback;
}

export default function LoginPage() {
  const { login, isPending } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    try {
      await login(email, password);
    } catch (err) {
      setErrorMsg(getApiError(err, t('auth.errors.loginFailed')));
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-surface-dim)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        padding: 'var(--space-12)',
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-card)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <h1 style={{
            margin: '0 0 var(--space-2)',
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--color-text-primary)',
          }}>
            {t('app.title')}
          </h1>
          <p style={{
            margin: 0,
            fontSize: 'var(--text-base)',
            color: 'var(--color-text-secondary)',
          }}>
            {t('app.subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <input
            className="input"
            type="email"
            placeholder={t('auth.email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <input
            className="input"
            type="password"
            placeholder={t('auth.password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          {errorMsg && (
            <p className="input-error-msg" role="alert">
              ! {errorMsg}
            </p>
          )}

          <button
            type="submit"
            className="btn-save"
            disabled={isPending}
            style={{ width: '100%' }}
          >
            {isPending ? '...' : t('auth.loginBtn')}
          </button>

          <p style={{
            margin: 0,
            textAlign: 'center',
            fontSize: 'var(--text-base)',
            color: 'var(--color-text-secondary)',
          }}>
            {t('auth.noAccount')}{' '}
            <Link
              to="/register"
              style={{ color: 'var(--color-primary-600)', textDecoration: 'none', fontWeight: 'var(--font-medium)' }}
            >
              {t('auth.register')}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
