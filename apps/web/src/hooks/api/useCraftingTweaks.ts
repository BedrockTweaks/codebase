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

export function craftingTweaksQueryOptions(): UndefinedInitialDataOptions<
  SectionResponse,
  Error,
  SectionResponse,
  readonly ['crafting-tweaks']
> {
  return queryOptions({
    queryKey: ['crafting-tweaks'] as const,
    queryFn: () => fetchSectionData(Section.CraftingTweaks),
  });
}

/**
 * Fetch all crafting tweaks
 * Endpoint: GET /api/crafting-tweaks
 */
export function useCraftingTweaks(): UseQueryResult<SectionResponse, Error> {
  return useQuery(craftingTweaksQueryOptions());
}

/**
 * Download selected crafting tweaks as a zip file
 * Endpoint: POST /api/crafting-tweaks
 */
export function useDownloadCraftingTweaks(): UseMutationResult<Blob, Error, DownloadRequest> {
  return useMutation({
    mutationFn: (data: DownloadRequest) => downloadPacks(Section.CraftingTweaks, data),
  });
}
