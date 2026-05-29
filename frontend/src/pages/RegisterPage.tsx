import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';

interface FieldErrors {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const { register, isPending } = useAuth();
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  function validateName(n: string): string {
    if (n.length < 1 || n.length > 50) return t('profile.errors.nameLength');
    return '';
  }

  function validateEmail(e: string): string {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return t('auth.errors.registerFailed');
    return '';
  }

  function validatePassword(p: string): string {
    if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(p) || p.length < 8) return t('profile.errors.passwordFormat');
    return '';
  }

  function validateConfirmPassword(p: string, c: string): string {
    if (p !== c) return t('profile.errors.passwordMismatch');
    return '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    const confirmErr = validateConfirmPassword(password, confirmPassword);

    setErrors({
      name: nameErr,
      email: emailErr,
      password: passwordErr,
      confirmPassword: confirmErr,
    });

    if (nameErr || emailErr || passwordErr || confirmErr) return;

    try {
      await register(email, password, name);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const code = err.response?.data?.error?.code;
        const message = err.response?.data?.error?.message;
        if (code === 'DUPLICATE_EMAIL') {
          setErrors((prev) => ({ ...prev, email: message ?? t('auth.errors.registerFailed') }));
        } else {
          setErrors((prev) => ({ ...prev, email: message ?? t('auth.errors.registerFailed') }));
        }
      }
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
          <div>
            <input
              className={`input${errors.name ? ' input--error' : ''}`}
              type="text"
              placeholder={t('auth.name')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
            {errors.name && (
              <p className="input-error-msg" role="alert">
                ! {errors.name}
              </p>
            )}
          </div>

          <div>
            <input
              className={`input${errors.email ? ' input--error' : ''}`}
              type="email"
              placeholder={t('auth.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            {errors.email && (
              <p className="input-error-msg" role="alert">
                ! {errors.email}
              </p>
            )}
          </div>

          <div>
            <input
              className={`input${errors.password ? ' input--error' : ''}`}
              type="password"
              placeholder={t('auth.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            {errors.password && (
              <p className="input-error-msg" role="alert">
                ! {errors.password}
              </p>
            )}
          </div>

          <div>
            <input
              className={`input${errors.confirmPassword ? ' input--error' : ''}`}
              type="password"
              placeholder={t('auth.passwordConfirm')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <p className="input-error-msg" role="alert">
                ! {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="btn-save"
            disabled={isPending}
            style={{ width: '100%' }}
          >
            {isPending ? '...' : t('auth.registerBtn')}
          </button>

          <p style={{
            margin: 0,
            textAlign: 'center',
            fontSize: 'var(--text-base)',
            color: 'var(--color-text-secondary)',
          }}>
            {t('auth.hasAccount')}{' '}
            <Link
              to="/login"
              style={{ color: 'var(--color-primary-600)', textDecoration: 'none', fontWeight: 'var(--font-medium)' }}
            >
              {t('auth.login')}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
