import { useState } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useTodos } from '../../hooks/useTodos';
import WeekView from './WeekView';
import type { Todo, TodoStatus } from '../../types';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { locale: ko }),
  getDay,
  locales: { ko },
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource: Todo;
}

function getEventColor(todo: Todo): string {
  if (todo.isOverdue && todo.status !== 'DONE') return '#d93025';
  if (todo.status === 'DONE') return '#1e8e3e';
  if (todo.status === 'IN_PROGRESS') return '#f9ab00';
  return '#70757a';
}

function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function todoToEvent(todo: Todo): CalendarEvent | null {
  const startStr = todo.startDate?.slice(0, 10) ?? todo.dueDate?.slice(0, 10);
  if (!startStr) return null;
  const start = parseLocalDate(startStr);
  const dueStr = todo.dueDate?.slice(0, 10);
  const end = dueStr ? addDays(parseLocalDate(dueStr), 1) : addDays(start, 1);
  return { id: todo.id, title: todo.title, start, end, allDay: true, resource: todo };
}

interface Props {
  categoryId?: string;
  status?: TodoStatus | 'OVERDUE';
  calView: 'month' | 'week';
  onEditTodo: (todo: Todo) => void;
}

export default function CalendarView({ categoryId, status, calView, onEditTodo }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { todos } = useTodos({ categoryId, status });
  const { t } = useTranslation();

  const messages = {
    today: t('calendar.today'),
    previous: t('calendar.previous'),
    next: t('calendar.next'),
    month: t('calendar.month'),
    agenda: t('calendar.agenda'),
    date: t('calendar.date'),
    time: t('calendar.time'),
    event: t('calendar.event'),
    noEventsInRange: t('calendar.noEvents'),
  };

  const events: CalendarEvent[] = todos
    .map(todoToEvent)
    .filter((e): e is CalendarEvent => e !== null);

  const eventStyleGetter = (event: CalendarEvent) => {
    const color = getEventColor(event.resource);
    return {
      style: {
        backgroundColor: color,
        borderColor: color,
        color: '#fff',
        borderRadius: '4px',
        fontSize: '12px',
        padding: '1px 4px',
      },
    };
  };

  return (
    <div className="calendar-wrapper">
      {calView === 'month' ? (
        <div className="calendar-inner">
          <Calendar
            localizer={localizer}
            events={events}
            view={Views.MONTH}
            views={[Views.MONTH]}
            date={currentDate}
            onNavigate={setCurrentDate}
            onView={() => {}}
            style={{ height: '100%' }}
            messages={messages}
            culture="ko"
            eventPropGetter={eventStyleGetter}
            onSelectEvent={(event) => onEditTodo(event.resource)}
            popup
          />
        </div>
      ) : (
        <div className="calendar-inner">
          <WeekView todos={todos} onEditTodo={onEditTodo} />
        </div>
      )}
    </div>
  );
}
