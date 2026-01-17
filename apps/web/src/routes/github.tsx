import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/github')({
  beforeLoad: () => {
    // Redirect to GitHub repository
    window.location.href = 'https://github.com/bedrocktweaks';
    throw redirect({ to: '/' });
  },
});
