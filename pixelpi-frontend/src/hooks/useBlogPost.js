import { useQuery } from '@tanstack/react-query';
import { api } from '../api/public';

export function useBlogPost(slug) {
  return useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      const res = await api.getBlogPost(slug);
      const payload = res.data;
      // Response shape: { success, data: { post: {...}, related: [] } }
      return payload?.data?.post ?? payload?.data ?? payload;
    },
    enabled: !!slug,
    staleTime: 300_000,
    retry: false,
  });
}