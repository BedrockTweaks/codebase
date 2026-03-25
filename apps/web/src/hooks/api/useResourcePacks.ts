import { type DownloadRequest, type SectionResponse } from '@/models';
import { downloadPacks, fetchSectionData } from '@/utils/api';
import type { GeneratedPackResponse } from '@bt/types';
import {
  queryOptions,
  useMutation,
  useSuspenseQuery,
  UseSuspenseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query';

export const resourcePacksQueryOptions = queryOptions({
  queryKey: ['resource-packs'] as const,
  queryFn: () => fetchSectionData('resource-packs'),
});

/**
 * Fetch all resource packs
 * Endpoint: GET /api/resource-packs
 */
export function useResourcePacks(): UseSuspenseQueryResult<SectionResponse, Error> {
  return useSuspenseQuery(resourcePacksQueryOptions);
}

/**
 * Download selected resource packs as a zip file
 * Endpoint: POST /api/resource-packs
 */
export function useDownloadResourcePacks(): UseMutationResult<
  GeneratedPackResponse,
  Error,
  DownloadRequest
> {
  return useMutation({
    mutationFn: (data: DownloadRequest) => downloadPacks('resource-packs', data),
  });
}
