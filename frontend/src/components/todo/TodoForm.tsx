import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { todoApi } from '../../api/todoApi';
import { useCategories } from '../../hooks/useCategories';
import type { Todo } from '../../types';

interface Props {
  todo?: Todo;
  onClose: () => void;
}

export default function TodoForm({ todo, onClose }: Props) {
  const queryClient = useQueryClient();
  const { categories } = useCategories();
  const { t } = useTranslation();

  const [title, setTitle] = useState(todo?.title ?? '');
  const [description, setDescription] = useState(todo?.description ?? '');
  const [startDate, setStartDate] = useState(todo?.startDate?.slice(0, 10) ?? '');
  const [dueDate, setDueDate] = useState(todo?.dueDate?.slice(0, 10) ?? '');
  const [categoryId, setCategoryId] = useState(todo?.categoryId ?? '');
  const [titleError, setTitleError] = useState('');
  const [startDateError, setStartDateError] = useState('');
  const [dueDateError, setDueDateError] = useState('');
  const [dateError, setDateError] = useState('');
  const [isPending, setIsPending] = useState(false);

  const isEditMode = todo !== undefined;

  const handleSave = async () => {
    setTitleError('');
    setStartDateError('');
    setDueDateError('');
    setDateError('');

    let hasError = false;
    if (!title.trim()) {
      setTitleError(t('todo.errors.titleRequired'));
      hasError = true;
    } else if (title.length > 100) {
      setTitleError(t('todo.errors.titleTooLong'));
      hasError = true;
    }
    if (!startDate) {
      setStartDateError(t('todo.errors.startDateRequired'));
      hasError = true;
    }
    if (!dueDate) {
      setDueDateError(t('todo.errors.dueDateRequired'));
      hasError = true;
    }
    if (startDate && dueDate && dueDate < startDate) {
      setDateError(t('todo.errors.dateRange'));
      hasError = true;
    }
    if (hasError) return;

    const data = {
      title: title.trim(),
      ...(description ? { description } : {}),
      ...(startDate ? { startDate } : {}),
      ...(dueDate ? { dueDate } : {}),
      ...(categoryId ? { categoryId } : {}),
    };

    setIsPending(true);
    try {
      if (isEditMode) {
        await todoApi.update(todo.id, data);
      } else {
        await todoApi.create(data);
      }
      await queryClient.invalidateQueries({ queryKey: ['todos'] });
      onClose();
    } catch {
      setTitleError(t('todo.errors.saveFailed'));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="popup" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <span>{isEditMode ? t('todo.editTitle') : t('todo.registerTitle')}</span>
          <button type="button" className="popup-close" onClick={onClose} aria-label={t('todo.closeBtn')}>
            ×
          </button>
        </div>

        <div style={{ padding: '0 var(--space-4)' }}>
          <input
            type="text"
            className={`input-title${titleError ? ' input-title--error' : ''}`}
            placeholder={t('todo.titlePlaceholder')}
            value={title}
            onChange={(e) => { setTitle(e.target.value); if (titleError) setTitleError(''); }}
          />
          {titleError && <p className="input-error-msg">{titleError}</p>}

          <textarea
            className="input"
            style={{ resize: 'vertical', height: '80px' }}
            rows={3}
            maxLength={1000}
            value={description ?? ''}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('todo.descriptionPlaceholder')}
          />
          <p style={{ textAlign: 'right', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
            {t('todo.descriptionCounter', { count: (description ?? '').length })}
          </p>

          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-1)' }}>
                {t('todo.startDate')} <span style={{ color: 'var(--color-error)' }}>{t('todo.required')}</span>
              </label>
              <input
                type="date"
                className={`input${startDateError ? ' input--error' : ''}`}
                value={startDate ?? ''}
                onChange={(e) => { setStartDate(e.target.value); if (startDateError) setStartDateError(''); }}
              />
              {startDateError && <p className="input-error-msg" style={{ padding: 0 }}>{startDateError}</p>}
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-1)' }}>
                {t('todo.dueDate')} <span style={{ color: 'var(--color-error)' }}>{t('todo.required')}</span>
              </label>
              <input
                type="date"
                className={`input${dueDateError ? ' input--error' : ''}`}
                value={dueDate ?? ''}
                onChange={(e) => { setDueDate(e.target.value); if (dueDateError) setDueDateError(''); }}
              />
            </div>
          </div>
          {dueDateError && <p className="input-error-msg">{dueDateError}</p>}
          {dateError && <p className="input-error-msg">{dateError}</p>}

          <select
            className="input"
            value={categoryId ?? ''}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">{t('todo.categoryPlaceholder')}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="popup-actions">
          <button type="button" className="btn-text" onClick={onClose}>
            {t('todo.cancelBtn')}
          </button>
          <button
            type="button"
            className="btn-save"
            onClick={handleSave}
            disabled={isPending}
          >
            {t('todo.saveBtn')}
          </button>
        </div>
      </div>
    </div>
  );
}
