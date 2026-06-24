import { useQuery } from '@tanstack/react-query';
import { api } from '../api/public';

export function useCareerOpenings() {
  return useQuery({
    queryKey: ['career-openings'],
    queryFn: async () => {
      const res = await api.getCareerOpenings();
      const payload = res.data;
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      return [];
    },
    staleTime: 300_000,
  });
}