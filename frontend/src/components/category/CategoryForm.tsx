import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { categoryApi } from '../../api/categoryApi';

export default function CategoryForm() {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (name.length === 0) return;

    if (name.length > 30) {
      setError(t('profile.errors.nameLength'));
      return;
    }

    setError('');
    setIsPending(true);

    try {
      await categoryApi.create({ name });
      setName('');
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
    } catch {
      setError(t('profile.errors.generic'));
    } finally {
      setIsPending(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (error) setError('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <input
        type="text"
        className={`input${error ? ' input--error' : ''}`}
        placeholder={t('category.newNamePlaceholder')}
        value={name}
        onChange={handleChange}
      />
      {error && <p className="input-error-msg">{error}</p>}
      <button
        type="submit"
        className="btn-save"
        disabled={isPending}
        style={{ alignSelf: 'flex-start', padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--text-sm)' }}
      >
        {t('category.addBtn')}
      </button>
    </form>
  );
}
