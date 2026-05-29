import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, List, CalendarDays } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useCategories } from '../hooks/useCategories';
import CategoryList from '../components/category/CategoryList';
import CategoryForm from '../components/category/CategoryForm';
import TodoList from '../components/todo/TodoList';
import TodoForm from '../components/todo/TodoForm';
import CalendarView from '../components/calendar/CalendarView';
import LanguageToggle from '../components/common/LanguageToggle';
import ThemeToggle from '../components/common/ThemeToggle';
import type { Todo, TodoStatus } from '../types';

export default function MainPage() {
  const { logout } = useAuth();
  const { categories } = useCategories();
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [calView, setCalView] = useState<'month' | 'week'>('month');
  const [showMobileCategoryForm, setShowMobileCategoryForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TodoStatus | 'OVERDUE' | undefined>(undefined);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  const filterChips = [
    { label: t('filter.all'), value: undefined, cls: '' },
    { label: t('filter.notStarted'), value: 'NOT_STARTED' as const, cls: '' },
    { label: t('filter.inProgress'), value: 'IN_PROGRESS' as const, cls: 'filter-chip--in-progress' },
    { label: t('filter.done'), value: 'DONE' as const, cls: 'filter-chip--done' },
    { label: t('filter.overdue'), value: 'OVERDUE' as const, cls: 'filter-chip--overdue' },
  ];

  return (
    <div className="app-layout">
      <header style={{ gridArea: 'header', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 var(--space-4)', borderBottom: '1px solid var(--color-border)' }}>
        <h1 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, margin: 0 }}>{t('app.title')}</h1>
        <nav style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <Link to="/profile" style={{ textDecoration: 'none', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
            {t('profile.title')}
          </Link>
          <ThemeToggle />
          <LanguageToggle />
          <button
            type="button"
            className="btn-text"
            onClick={logout}
            style={{ fontSize: 'var(--text-sm)' }}
          >
            {t('auth.logout')}
          </button>
        </nav>
      </header>

      <aside style={{ gridArea: 'sidebar', borderRight: '1px solid var(--color-border)', padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', overflow: 'auto', background: 'var(--color-surface-dim)' }}>
        <CategoryList
          selectedCategoryId={categoryFilter}
          onSelect={setCategoryFilter}
        />
        <CategoryForm />
      </aside>

      <main style={{ gridArea: 'main', overflow: 'auto', padding: '16px', position: 'relative' }}>
        <div className="mobile-category-select">
          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
            <select
              value={categoryFilter ?? ''}
              onChange={(e) => setCategoryFilter(e.target.value || null)}
              className="input"
              style={{ flex: 1 }}
            >
              <option value="">{t('category.all')}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <button
              type="button"
              className="view-toggle-btn"
              onClick={() => setShowMobileCategoryForm((v) => !v)}
              aria-label={showMobileCategoryForm ? t('category.closeCategory') : t('category.addCategory')}
              title={t('category.addCategory')}
              style={{ flexShrink: 0 }}
            >
              {showMobileCategoryForm ? '✕' : '+'}
            </button>
          </div>
          {showMobileCategoryForm && <CategoryForm />}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
          <div className="filter-chips" style={{ marginBottom: 0, flex: 1 }}>
            {filterChips.map((chip) => (
              <button
                key={chip.label}
                type="button"
                className={`filter-chip ${chip.cls} ${statusFilter === chip.value ? 'filter-chip--active' : ''}`.trim()}
                onClick={() => setStatusFilter(chip.value)}
              >
                {chip.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-1)', flexShrink: 0 }}>
            {viewMode === 'calendar' && (
              <>
                <button
                  type="button"
                  className={`view-toggle-btn${calView === 'month' ? ' view-toggle-btn--active' : ''}`}
                  onClick={() => setCalView('month')}
                  title={t('view.month')}
                >
                  {t('view.month')}
                </button>
                <button
                  type="button"
                  className={`view-toggle-btn${calView === 'week' ? ' view-toggle-btn--active' : ''}`}
                  onClick={() => setCalView('week')}
                  title={t('view.week')}
                >
                  {t('view.week')}
                </button>
                <div style={{ width: 1, background: 'var(--color-border)', margin: '0 var(--space-1)' }} />
              </>
            )}
            <button
              type="button"
              className={`view-toggle-btn${viewMode === 'list' ? ' view-toggle-btn--active' : ''}`}
              onClick={() => setViewMode('list')}
              title={t('view.list')}
            >
              <List size={18} />
            </button>
            <button
              type="button"
              className={`view-toggle-btn${viewMode === 'calendar' ? ' view-toggle-btn--active' : ''}`}
              onClick={() => setViewMode('calendar')}
              title={t('view.calendar')}
            >
              <CalendarDays size={18} />
            </button>
          </div>
        </div>

        {viewMode === 'list' ? (
          <TodoList
            filters={{ status: statusFilter, categoryId: categoryFilter ?? undefined }}
            onEdit={(todo) => { setEditingTodo(todo); setIsModalOpen(true); }}
          />
        ) : (
          <CalendarView
            categoryId={categoryFilter ?? undefined}
            status={statusFilter}
            calView={calView}
            onEditTodo={(todo) => { setEditingTodo(todo); setIsModalOpen(true); }}
          />
        )}

        <button
          type="button"
          className="btn-fab"
          onClick={() => { setEditingTodo(null); setIsModalOpen(true); }}
          aria-label={t('todo.addBtn')}
        >
          <Plus size={24} />
        </button>

        {isModalOpen && (
          <TodoForm
            todo={editingTodo ?? undefined}
            onClose={() => { setIsModalOpen(false); setEditingTodo(null); }}
          />
        )}
      </main>
    </div>
  );
}
