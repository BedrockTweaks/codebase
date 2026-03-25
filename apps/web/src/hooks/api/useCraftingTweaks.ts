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

export const craftingTweaksQueryOptions = queryOptions({
  queryKey: ['crafting-tweaks'] as const,
  queryFn: () => fetchSectionData('crafting-tweaks'),
});

/**
 * Fetch all crafting tweaks
 * Endpoint: GET /api/crafting-tweaks
 */
export function useCraftingTweaks(): UseSuspenseQueryResult<SectionResponse, Error> {
  return useSuspenseQuery(craftingTweaksQueryOptions);
}

/**
 * Download selected crafting tweaks as a zip file
 * Endpoint: POST /api/crafting-tweaks
 */
export function useDownloadCraftingTweaks(): UseMutationResult<
  GeneratedPackResponse,
  Error,
  DownloadRequest
> {
  return useMutation({
    mutationFn: (data: DownloadRequest) => downloadPacks('crafting-tweaks', data),
  });
}
