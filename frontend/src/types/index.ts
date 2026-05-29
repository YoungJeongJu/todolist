export type ThemeMode = 'LIGHT' | 'DARK';
export type TodoStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'DONE';

export interface User {
  id: string;
  email: string;
  name: string;
  themeMode: ThemeMode;
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  isDefault: boolean;
  userId: string;
  createdAt: string;
}

export interface Todo {
  id: string;
  title: string;
  description: string | null;
  status: TodoStatus;
  startDate: string | null;
  dueDate: string | null;
  categoryId: string;
  userId: string;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TodoFilters {
  status?: TodoStatus | 'OVERDUE';
  categoryId?: string;
}
