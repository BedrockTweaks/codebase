import { Toaster } from '@/components/toaster';
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
    scripts: [
      {
        src: 'https://www.googletagmanager.com/gtag/js?id=G-PS7REQ4ES8',
        async: true,
      },
      {
        children: `
          window.dataLayer = window.dataLayer || [];
          function gtag() {
            dataLayer.push(arguments);
          }
          gtag('js', new Date());
          gtag('config', 'G-PS7REQ4ES8');
        `,
      },
      {
        children: `
          window.googletag = window.googletag || { cmd: [] };
          window.reloadGoogleAds = reloadGoogleAds;
          function reloadGoogleAds() {
            googletag.cmd.push(() => {
              googletag.pubads().refresh();
            });
          }
        `,
      },
      {
        children: `
          (function(w, d, s, l, i) {
            w[l] = w[l] || [];
            w[l].push({
              'gtm.start': new Date().getTime(),
              event: 'gtm.js'
            });
            var f = d.getElementsByTagName(s)[0],
              j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : '';
            j.async = true;
            j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
            f.parentNode.insertBefore(j, f);
          })(window, document, 'script', 'dataLayer', 'GTM-MZRBPKVL');
        `,
      },
    ],
  }),

  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <html lang={'en'}>
      <head>
        <HeadContent />
      </head>
      <body>
        <noscript>
          <iframe
            src={'https://www.googletagmanager.com/ns.html?id=GTM-MZRBPKVL'}
            height={'0'}
            width={'0'}
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>

        <ChakraProvider value={system}>
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
