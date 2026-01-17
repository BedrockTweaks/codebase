import { createFileRoute } from '@tanstack/react-router';
import { JSX } from 'react';

export const Route = createFileRoute('/addons')({ component: Addons });

function Addons(): JSX.Element {
  return (
    <div>
      <h1>{'Addons'}</h1>
      <p>{'Explore addons to enhance your Minecraft Bedrock experience.'}</p>
    </div>
  );
}
