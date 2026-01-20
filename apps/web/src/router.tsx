import { InternalServerErrorPage, NotFoundPage } from '@/components/Error';
import * as Sentry from '@sentry/tanstackstart-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter } from '@tanstack/react-router';
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query';

// Import the generated route tree
import { routeTree } from './routeTree.gen';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    defaultPreload: 'intent',
    scrollRestoration: true,
    trailingSlash: 'never',
    defaultNotFoundComponent: NotFoundPage,
    defaultErrorComponent: InternalServerErrorPage,
    Wrap: (props: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>
    ),
  });

  setupRouterSsrQueryIntegration({ router, queryClient });

  // Initialize Sentry on the client side only
  if (!router.isServer) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [
        Sentry.tanstackRouterBrowserTracingIntegration(router),
      ],
    });
  }

  return router;
};

declare module '@tanstack/react-router' {
  interface Register {
    // This infers the type of our router and registers it across your entire project
    router: ReturnType<typeof getRouter>;
  }
}
