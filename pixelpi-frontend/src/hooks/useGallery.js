import { useQuery } from '@tanstack/react-query';
import { api } from '../api/public';

function normaliseGalleryPayload(payload) {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload)) return payload;
  return [];
}

export function useGallery() {
  return useQuery({
    queryKey: ['gallery'],
    queryFn: async () => {
      const res = await api.getGallery();
      return normaliseGalleryPayload(res.data);
    },
  });
}

export function useFeaturedGallery({ limit = 4 } = {}) {
  const query = useGallery();
  const data = (query.data ?? [])
    .filter((item) => item.featured)
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
    .slice(0, limit);
  return { ...query, data };
}