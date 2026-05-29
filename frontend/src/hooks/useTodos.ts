import { useQuery } from '@tanstack/react-query';
import { todoApi } from '../api/todoApi';
import type { TodoFilters } from '../types';

export function useTodos(filters?: TodoFilters) {
  const query = useQuery({
    queryKey: ['todos', filters],
    queryFn: () => todoApi.getAll(filters).then((r) => {
      const d = r.data as unknown as { todos: import('../types').Todo[] } | import('../types').Todo[];
      return Array.isArray(d) ? d : d.todos;
    }),
  });

  return {
    todos: Array.isArray(query.data) ? query.data : [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
