import { craftingTweaksQueryOptions } from '@/hooks/api/useCraftingTweaks';
import { createFileRoute } from '@tanstack/react-router';
import { JSX } from 'react';

export const Route = createFileRoute('/crafting-tweaks')({
  component: CraftingTweaks,
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(craftingTweaksQueryOptions),
  staticData: {
    title: 'Bedrock Tweaks - Crafting Tweaks',
  },
});

function CraftingTweaks(): JSX.Element {
  return (
    <div>
      <h1>{'Crafting Tweaks'}</h1>
      <p>{'Discover crafting tweaks and improvements for Bedrock Edition.'}</p>
    </div>
  );
}
