import { useQuery } from '@tanstack/react-query';
import { api } from '../api/public';

export function useBlogPosts(params = {}) {
  return useQuery({
    queryKey: ['blog-posts', params],
    queryFn: async () => {
      const res = await api.getBlogPosts(params);
      const payload = res.data;
      // Handle { success, data: { posts, categories, pagination } } and flat fallback
      return payload?.data ?? payload;
    },
    staleTime: 60_000,
  });
}