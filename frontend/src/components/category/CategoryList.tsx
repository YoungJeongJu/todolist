import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCategories } from '../../hooks/useCategories';
import { categoryApi } from '../../api/categoryApi';
import ConfirmDialog from '../common/ConfirmDialog';
import type { Category } from '../../types';

interface Props {
  selectedCategoryId: string | null;
  onSelect: (id: string | null) => void;
}

export default function CategoryList({ selectedCategoryId, onSelect }: Props) {
  const { categories, isLoading, error } = useCategories();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await categoryApi.remove(deleteTarget.id);
    await queryClient.invalidateQueries({ queryKey: ['categories'] });
    setDeleteTarget(null);
  };

  const handleDeleteCancel = () => {
    setDeleteTarget(null);
  };

  if (isLoading) {
    return <div className="category-list">...</div>;
  }

  if (error) {
    return <div className="category-list">{t('category.title')}</div>;
  }

  return (
    <>
      <div className="category-list">
        <p className="category-list__section-title">{t('category.title')}</p>

        <div
          className="category-item"
          style={{
            background: selectedCategoryId === null ? 'var(--color-surface-dim)' : undefined,
            color: selectedCategoryId === null ? 'var(--color-primary-600)' : undefined,
            cursor: 'pointer',
          }}
          onClick={() => onSelect(null)}
        >
          <span className="category-item__name">{t('category.all')}</span>
        </div>

        {categories.map((category) => (
          <div
            key={category.id}
            className="category-item"
            style={{
              background: selectedCategoryId === category.id ? 'var(--color-surface-dim)' : undefined,
              color: selectedCategoryId === category.id ? 'var(--color-primary-600)' : undefined,
              cursor: 'pointer',
            }}
            onClick={() => onSelect(category.id)}
          >
            <span className="category-item__name">{category.name}</span>
            {!category.isDefault && (
              <span className="category-item__actions">
                <button
                  type="button"
                  className="btn-text"
                  style={{ padding: 'var(--space-1)', color: 'var(--color-text-secondary)' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(category);
                  }}
                  aria-label={t('category.deleteLabel', { name: category.name })}
                >
                  <Trash2 size={18} />
                </button>
              </span>
            )}
          </div>
        ))}
      </div>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title={t('category.title')}
        message={`'${deleteTarget?.name}'`}
        confirmLabel={t('todo.deleteBtn')}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  );
}
