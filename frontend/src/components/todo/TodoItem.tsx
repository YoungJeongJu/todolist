import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Todo, TodoStatus } from '../../types';

interface Props {
  todo: Todo;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
  onStatusChange: (id: string, status: TodoStatus) => void;
}

function formatDueDate(dueDate: string): string {
  const date = new Date(dueDate);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `~${month}/${day}`;
}

function getCardClass(todo: Todo): string {
  if (todo.isOverdue && todo.status !== 'DONE') return 'todo-card todo-card--overdue';
  if (todo.status === 'IN_PROGRESS') return 'todo-card todo-card--in-progress';
  if (todo.status === 'DONE') return 'todo-card todo-card--done';
  return 'todo-card todo-card--not-started';
}

export default function TodoItem({ todo, onEdit, onDelete, onStatusChange }: Props) {
  const { t } = useTranslation();
  const titleClass = `todo-card__title${todo.status === 'DONE' ? ' todo-card__title--done' : ''}`;

  return (
    <div
      className={getCardClass(todo)}
      onClick={() => onEdit(todo)}
      style={{ cursor: 'pointer' }}
    >
      <div className={titleClass}>{todo.title}</div>
      <div className="todo-card__meta">
        <select
          className="status-select"
          value={todo.status}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            e.stopPropagation();
            onStatusChange(todo.id, e.target.value as TodoStatus);
          }}
        >
          <option value="NOT_STARTED">{t('todo.status.NOT_STARTED')}</option>
          <option value="IN_PROGRESS">{t('todo.status.IN_PROGRESS')}</option>
          <option value="DONE">{t('todo.status.DONE')}</option>
        </select>

        {todo.dueDate && (
          <span className={todo.isOverdue && todo.status !== 'DONE' ? 'todo-card__date--overdue' : undefined}>
            {formatDueDate(todo.dueDate)}
          </span>
        )}

        <button
          type="button"
          className="btn-text"
          style={{ padding: 'var(--space-1)', marginLeft: 'auto' }}
          onClick={(e) => { e.stopPropagation(); onDelete(todo); }}
          aria-label={t('todo.deleteBtn')}
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
