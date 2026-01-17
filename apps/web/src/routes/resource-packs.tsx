import { createFileRoute } from '@tanstack/react-router';
import { JSX } from 'react';

export const Route = createFileRoute('/resource-packs')({
  component: ResourcePacks,
  staticData: {
    title: 'Bedrock Tweaks - Resource Packs',
  },
});

function ResourcePacks(): JSX.Element {
  return (
    <div>
      <h1>{'Resource Packs'}</h1>
      <p>{'Browse and download resource packs for Minecraft Bedrock Edition.'}</p>
    </div>
  );
}
