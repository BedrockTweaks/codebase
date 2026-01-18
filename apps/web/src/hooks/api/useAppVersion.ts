import { fetchLatestVersion } from '@/utils/api';
import { useQuery } from '@tanstack/react-query';

export function useAppVersion(): { version: string | undefined; isLoading: boolean } {
  const { data, isLoading } = useQuery({
    queryKey: ['appVersion'],
    queryFn: fetchLatestVersion,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    retry: 1,
  });

  return {
    version: data,
    isLoading,
  };
}
