import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/github')({
  beforeLoad: () => {
    // Redirect to GitHub repository
    window.location.href = 'https://github.com/your-username/bedrock-tweaks';
    throw redirect({ to: '/' });
  },
});
