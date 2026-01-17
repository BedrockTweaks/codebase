import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/discord')({
  beforeLoad: () => {
    // Redirect to Discord server
    window.location.href = 'https://discord.gg/xq9JpJ3';
    throw redirect({ to: '/' });
  },
});
