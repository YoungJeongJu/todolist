import { useQuery } from '@tanstack/react-query';
import { categoryApi } from '../api/categoryApi';

export function useCategories() {
  const query = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll().then((r) => {
      const d = r.data as unknown as { categories: import('../types').Category[] } | import('../types').Category[];
      return Array.isArray(d) ? d : d.categories;
    }),
  });

  const categories = Array.isArray(query.data) ? query.data : [];
  const defaultCategory = categories.find((c) => c.isDefault);

  return {
    categories,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    defaultCategory,
  };
}
