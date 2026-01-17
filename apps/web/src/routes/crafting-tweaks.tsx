import { createFileRoute } from '@tanstack/react-router';
import { JSX } from 'react';

export const Route = createFileRoute('/crafting-tweaks')({ component: CraftingTweaks });

function CraftingTweaks(): JSX.Element {
  return (
    <div>
      <h1>{'Crafting Tweaks'}</h1>
      <p>{'Discover crafting tweaks and improvements for Bedrock Edition.'}</p>
    </div>
  );
}
