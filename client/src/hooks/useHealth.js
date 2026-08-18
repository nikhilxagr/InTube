import { useQuery } from '@tanstack/react-query';
import { MediaService } from '../services/media.service.js';

export function useHealth() {
  return useQuery({
    queryKey: ['serverHealth'],
    queryFn: () => MediaService.getHealth(),
    refetchInterval: 30000, // Check every 30s
    retry: 2,
    staleTime: 10000
  });
}
