import { type DownloadRequest, type SectionResponse } from '@/models';
import { downloadPacks, fetchSectionData } from '@/utils/api';
import {
  queryOptions,
  useMutation,
  useSuspenseQuery,
  UseSuspenseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query';

export const addonsQueryOptions = queryOptions({
  queryKey: ['addons'] as const,
  queryFn: () => fetchSectionData('addons'),
});

/**
 * Fetch all addons
 * Endpoint: GET /api/addons
 */
export function useAddons(): UseSuspenseQueryResult<SectionResponse, Error> {
  return useSuspenseQuery(addonsQueryOptions);
}

/**
 * Download selected addons as a zip file
 * Endpoint: POST /api/addons
 */
export function useDownloadAddons(): UseMutationResult<Blob, Error, DownloadRequest> {
  return useMutation({
    mutationFn: (data: DownloadRequest) => downloadPacks('addons', data),
  });
}
