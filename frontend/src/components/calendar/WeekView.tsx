import { useState } from 'react';
import { startOfWeek, addDays, format, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import type { Todo } from '../../types';

function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function getEventColor(todo: Todo): string {
  if (todo.isOverdue && todo.status !== 'DONE') return '#d93025';
  if (todo.status === 'DONE') return '#1e8e3e';
  if (todo.status === 'IN_PROGRESS') return '#f9ab00';
  return '#70757a';
}

function getTodosForDay(todos: Todo[], day: Date): Todo[] {
  return todos.filter((todo) => {
    const startStr = todo.startDate?.slice(0, 10);
    const endStr = todo.dueDate?.slice(0, 10);
    if (!startStr && !endStr) return false;
    const start = parseLocalDate(startStr ?? endStr!);
    const end = parseLocalDate(endStr ?? startStr!);
    return day >= start && day <= end;
  });
}

interface Props {
  todos: Todo[];
  onEditTodo: (todo: Todo) => void;
}

export default function WeekView({ todos, onEditTodo }: Props) {
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 0 })
  );
  const { t } = useTranslation();

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekLabel = format(weekStart, 'yyyy년 M월', { locale: ko });

  return (
    <div className="week-view">
      <div className="week-view__nav">
        <button
          type="button"
          className="rbc-toolbar button"
          onClick={() => setWeekStart((d) => addDays(d, -7))}
        >
          {t('calendar.previous')}
        </button>
        <span className="week-view__label">{weekLabel}</span>
        <button
          type="button"
          className="rbc-toolbar button"
          onClick={() => setWeekStart((d) => addDays(d, 7))}
        >
          {t('calendar.next')}
        </button>
        <button
          type="button"
          className="rbc-toolbar button rbc-active"
          style={{ marginLeft: 'var(--space-2)' }}
          onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }))}
        >
          {t('calendar.today')}
        </button>
      </div>

      <div className="week-view__grid">
        {days.map((day) => {
          const dayTodos = getTodosForDay(todos, day);
          const isToday = isSameDay(day, new Date());
          return (
            <div
              key={day.toISOString()}
              className={`week-view__col${isToday ? ' week-view__col--today' : ''}`}
            >
              <div className="week-view__col-header">
                <span className="week-view__day-name">{DAY_LABELS[day.getDay()]}</span>
                <span className={`week-view__day-num${isToday ? ' week-view__day-num--today' : ''}`}>
                  {format(day, 'd')}
                </span>
              </div>
              <div className="week-view__events">
                {dayTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className="week-view__event"
                    style={{ backgroundColor: getEventColor(todo) }}
                    onClick={() => onEditTodo(todo)}
                    title={todo.title}
                  >
                    {todo.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
