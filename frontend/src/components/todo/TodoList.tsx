import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useTodos } from '../../hooks/useTodos';
import { todoApi } from '../../api/todoApi';
import TodoItem from './TodoItem';
import ConfirmDialog from '../common/ConfirmDialog';
import type { Todo, TodoFilters, TodoStatus } from '../../types';

interface Props {
  filters: TodoFilters;
  onEdit: (todo: Todo) => void;
}

export default function TodoList({ filters, onEdit }: Props) {
  const { todos, isLoading, error } = useTodos(filters);
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [deleteTarget, setDeleteTarget] = useState<Todo | null>(null);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await todoApi.remove(deleteTarget.id);
    await queryClient.invalidateQueries({ queryKey: ['todos'] });
    setDeleteTarget(null);
  };

  const handleDeleteCancel = () => {
    setDeleteTarget(null);
  };

  const handleStatusChange = async (id: string, status: TodoStatus) => {
    await todoApi.updateStatus(id, status);
    await queryClient.invalidateQueries({ queryKey: ['todos'] });
  };

  if (isLoading) {
    return <div>...</div>;
  }

  if (error) {
    return <div>{t('todo.empty')}</div>;
  }

  if (todos.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-state__title">{t('todo.empty')}</p>
        <p className="empty-state__desc">{t('todo.emptyDescription')}</p>
      </div>
    );
  }

  return (
    <>
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onEdit={onEdit}
          onDelete={setDeleteTarget}
          onStatusChange={handleStatusChange}
        />
      ))}

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title={t('todo.deleteBtn')}
        message={`'${deleteTarget?.title}'`}
        confirmLabel={t('todo.deleteBtn')}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  );
}
