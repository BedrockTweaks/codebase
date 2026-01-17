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

export function addonsQueryOptions(): UndefinedInitialDataOptions<
  SectionResponse,
  Error,
  SectionResponse,
  readonly ['addons']
> {
  return queryOptions({
    queryKey: ['addons'] as const,
    queryFn: () => fetchSectionData(Section.Addons),
  });
}

/**
 * Fetch all addons
 * Endpoint: GET /api/addons
 */
export function useAddons(): UseQueryResult<SectionResponse, Error> {
  return useQuery(addonsQueryOptions());
}

/**
 * Download selected addons as a zip file
 * Endpoint: POST /api/addons
 */
export function useDownloadAddons(): UseMutationResult<Blob, Error, DownloadRequest> {
  return useMutation({
    mutationFn: (data: DownloadRequest) => downloadPacks(Section.Addons, data),
  });
}
