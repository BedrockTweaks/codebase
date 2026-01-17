import { Section, type DownloadRequest, type SectionResponse } from '@/models';
import { downloadPacks, fetchSectionData } from '@/utils/api';
import {
  queryOptions,
  useMutation,
  useQuery,
  type UndefinedInitialDataOptions,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';

export function resourcePacksQueryOptions(): UndefinedInitialDataOptions<
  SectionResponse,
  Error,
  SectionResponse,
  readonly ['resource-packs']
> {
  return queryOptions({
    queryKey: ['resource-packs'] as const,
    queryFn: () => fetchSectionData(Section.ResourcePacks),
  });
}

/**
 * Fetch all resource packs
 * Endpoint: GET /api/resource-packs
 */
export function useResourcePacks(): UseQueryResult<SectionResponse, Error> {
  return useQuery(resourcePacksQueryOptions());
}

/**
 * Download selected resource packs as a zip file
 * Endpoint: POST /api/resource-packs
 */
export function useDownloadResourcePacks(): UseMutationResult<Blob, Error, DownloadRequest> {
  return useMutation({
    mutationFn: (data: DownloadRequest) => downloadPacks(Section.ResourcePacks, data),
  });
}
