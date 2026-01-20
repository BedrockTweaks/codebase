import { AdSenseAutoAds, AdSenseProvider } from '@bt/adsense';
import { useGoogleAnalytics } from '@bt/analytics';
import { Toaster } from '@/components/Toaster';
import { ADSENSE_CONFIG } from '@/config/adsense';
import { ANALYTICS_CONFIG } from '@/config/analytics';
import { system } from '@/theming';
import { Box, ChakraProvider, Flex } from '@chakra-ui/react';
import { TanStackDevtools } from '@tanstack/react-devtools';
import type { QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools';
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { JSX } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import appCss from '../styles.css?url';

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Bedrock Tweaks',
      },
      {
        name: 'author',
        content: 'DrAv0011',
      },
      {
        name: 'description',
        content: 'We tweak parts of vanilla Minecraft Bedrock that we believe can be a little better through resource packs, addons, and crafting tweaks. Ported Vanilla Tweaks to Minecraft Bedrock.',
      },
      {
        name: 'keywords',
        content: 'vanilla,tweaks,vanillatweaks,vanilla tweaks,minecraft,texture pack,resource,pack,resourcepack,bedrock,bedrock vanilla tweaks,mcpe vanilla tweaks,vanilla tweaks mcpe,vanilla tweaks bedrock,vanilla tweaks mobile,bedrock tweaks,mcpe tweaks,minecraft pocket edition,mcpe,vanilla tweaks pocket edition,bedrocktweaks,mcpetweaks,vanillatweaksmcpe,minecraft bedrock,minecraft bedrock edition,vanilla tweaks minecraft,vanilla tweaks datapack,vanilla tweaks texture pack,vanilla tweaks resource pack,minecraft bedrock texture pack,mcpe texture pack,minecraft bedrock resource pack',
      },
      {
        property: 'og:title',
        content: 'Bedrock Tweaks',
      },
      {
        property: 'og:description',
        content: 'We tweak parts of vanilla Minecraft Bedrock that we believe can be a little better through resource packs, addons, and crafting tweaks. Ported Vanilla Tweaks to Minecraft Bedrock.',
      },
      {
        property: 'og:image',
        content: '/assets/images/banner.png',
      },
      {
        property: 'og:url',
        content: 'https://bedrocktweaks.net',
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'twitter:title',
        content: 'Bedrock Tweaks',
      },
      {
        name: 'twitter:description',
        content: 'We tweak parts of vanilla Minecraft Bedrock that we believe can be a little better through resource packs, addons, and crafting tweaks. Ported Vanilla Tweaks to Minecraft Bedrock.',
      },
      {
        name: 'twitter:url',
        content: 'https://bedrocktweaks.net',
      },
      {
        name: 'twitter:image',
        content: '/assets/images/banner.png',
      },
    ],
    links: [
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.ico',
      },
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }): JSX.Element {
  useGoogleAnalytics(ANALYTICS_CONFIG.measurementId);

  return (
    <html lang={'en'}>
      <head>
        <HeadContent />
      </head>
      <body>
        <ChakraProvider value={system}>
          <AdSenseProvider clientId={ADSENSE_CONFIG.clientId}>
            <AdSenseAutoAds />
            <Flex
              direction={'column'}
              minH={'100vh'}
              bgImage={'url(/assets/images/background.png)'}
              bgSize={'cover'}
              bgPos={'center'}
              bgAttachment={'fixed'}
            >
              <Header />
              <Box flex={1}>
                {children}
              </Box>
              <Footer />
              <Toaster />
            </Flex>
          </AdSenseProvider>
        </ChakraProvider>

        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            {
              name: 'Tanstack Query',
              render: <ReactQueryDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
