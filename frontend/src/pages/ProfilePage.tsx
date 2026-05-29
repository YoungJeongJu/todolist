import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LanguageToggle from '../components/common/LanguageToggle';
import ThemeToggle from '../components/common/ThemeToggle';

function getApiError(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.error?.message ?? fallback;
  }
  return fallback;
}

export default function ProfilePage() {
  const { user, logout, updateProfile, deleteAccount, isPending } = useAuth();
  const { t } = useTranslation();

  const [newName, setNewName] = useState('');
  const [nameError, setNameError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmNewPasswordError, setConfirmNewPasswordError] = useState('');

  const [successMsg, setSuccessMsg] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (user) {
      setNewName(user.name);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.name]);

  function showSuccess() {
    setSuccessMsg(t('profile.saved'));
    setTimeout(() => setSuccessMsg(''), 3000);
  }

  async function handleNameSave(e: React.FormEvent) {
    e.preventDefault();
    setNameError('');

    if (newName.length < 1 || newName.length > 50) {
      setNameError(t('profile.errors.nameLength'));
      return;
    }

    try {
      await updateProfile({ name: newName });
      showSuccess();
    } catch (err) {
      setNameError(getApiError(err, t('profile.errors.generic')));
    }
  }

  async function handlePasswordSave(e: React.FormEvent) {
    e.preventDefault();
    setCurrentPasswordError('');
    setNewPasswordError('');
    setConfirmNewPasswordError('');

    let hasError = false;

    if (!currentPassword) {
      setCurrentPasswordError(t('profile.errors.currentPasswordRequired'));
      hasError = true;
    }

    if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(newPassword) || newPassword.length < 8) {
      setNewPasswordError(t('profile.errors.passwordFormat'));
      hasError = true;
    }

    if (newPassword !== confirmNewPassword) {
      setConfirmNewPasswordError(t('profile.errors.passwordMismatch'));
      hasError = true;
    }

    if (hasError) return;

    try {
      await updateProfile({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      showSuccess();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setCurrentPasswordError(t('profile.errors.currentPasswordWrong'));
      } else {
        setCurrentPasswordError(getApiError(err, t('profile.errors.generic')));
      }
    }
  }

  async function handleDeleteAccount() {
    setShowDeleteDialog(false);
    try {
      await deleteAccount();
    } catch {
      // deleteAccount 내부에서 navigate('/login') 처리됨
    }
  }

  return (
    <>
      <header style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
        padding: 'var(--space-4) var(--space-6)',
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-outline)',
      }}>
        <Link
          to="/"
          style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--color-text-primary)',
            textDecoration: 'none',
            flex: 1,
          }}
        >
          {t('app.title')}
        </Link>
        <Link
          to="/profile"
          style={{
            fontSize: 'var(--text-base)',
            color: 'var(--color-primary-600)',
            textDecoration: 'none',
            fontWeight: 'var(--font-medium)',
          }}
        >
          {t('profile.title')}
        </Link>
        <ThemeToggle />
        <LanguageToggle />
        <button type="button" className="btn-text" onClick={logout}>
          {t('auth.logout')}
        </button>
      </header>

      <main style={{
        maxWidth: '560px',
        margin: 'var(--space-8) auto',
        padding: '0 var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
      }}>
        {successMsg && (
          <p className="success-msg" role="status">{successMsg}</p>
        )}

        <div style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-card)',
          padding: 'var(--space-6)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-6)',
        }}>
          <h2 style={{ margin: 0, fontSize: 'var(--text-md)', fontWeight: 'var(--font-medium)' }}>
            {t('profile.myInfo')}
          </h2>

          <div>
            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
              {t('auth.email')}
            </label>
            <input
              className="input"
              type="email"
              value={user?.email ?? ''}
              readOnly
              style={{ background: 'var(--color-surface-dim)', cursor: 'default' }}
            />
          </div>

          <form onSubmit={handleNameSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
              {t('profile.changeName')}
            </label>
            <div>
              <input
                className={`input${nameError ? ' input--error' : ''}`}
                type="text"
                placeholder={t('profile.newNamePlaceholder')}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              {nameError && (
                <p className="input-error-msg" role="alert">! {nameError}</p>
              )}
            </div>
            <div>
              <button type="submit" className="btn-save" disabled={isPending}>
                {t('profile.saveNameBtn')}
              </button>
            </div>
          </form>

          <form onSubmit={handlePasswordSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
              {t('profile.changePassword')}
            </label>
            <div>
              <input
                className={`input${currentPasswordError ? ' input--error' : ''}`}
                type="password"
                placeholder={t('profile.currentPasswordPlaceholder')}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
              {currentPasswordError && (
                <p className="input-error-msg" role="alert">! {currentPasswordError}</p>
              )}
            </div>
            <div>
              <input
                className={`input${newPasswordError ? ' input--error' : ''}`}
                type="password"
                placeholder={t('profile.newPasswordPlaceholder')}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
              {newPasswordError && (
                <p className="input-error-msg" role="alert">! {newPasswordError}</p>
              )}
            </div>
            <div>
              <input
                className={`input${confirmNewPasswordError ? ' input--error' : ''}`}
                type="password"
                placeholder={t('profile.confirmNewPasswordPlaceholder')}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                autoComplete="new-password"
              />
              {confirmNewPasswordError && (
                <p className="input-error-msg" role="alert">! {confirmNewPasswordError}</p>
              )}
            </div>
            <div>
              <button type="submit" className="btn-save" disabled={isPending}>
                {t('profile.changePasswordBtn')}
              </button>
            </div>
          </form>

        </div>

        <div style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-card)',
          padding: 'var(--space-6)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}>
          <h2 style={{ margin: 0, fontSize: 'var(--text-md)', fontWeight: 'var(--font-medium)' }}>
            {t('profile.deleteAccount')}
          </h2>
          <p style={{ margin: 0, fontSize: 'var(--text-base)', color: 'var(--color-text-secondary)' }}>
            {t('profile.deleteAccountWarning')}
          </p>
          <div>
            <button
              type="button"
              className="btn-danger"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isPending}
            >
              {t('profile.deleteAccountBtn')}
            </button>
          </div>
        </div>
      </main>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title={t('confirm.deleteAccount.title')}
        message={t('confirm.deleteAccount.message')}
        confirmLabel={t('confirm.deleteAccount.confirmLabel')}
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </>
  );
}
