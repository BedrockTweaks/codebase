import { AdSense } from '@bt/adsense';
import { SectionPageFooter, SectionPageLayout } from '@/components/pack-selection';
import { ADSENSE_CONFIG } from '@/config/adsense';
import {
  resourcePacksQueryOptions,
  useDownloadResourcePacks,
  useResourcePacks,
} from '@/hooks/api/useResourcePacks';
import { Container, Heading } from '@chakra-ui/react';
import { createFileRoute } from '@tanstack/react-router';
import { JSX } from 'react';

export const Route = createFileRoute('/resource-packs')({
  component: ResourcePacks,
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(resourcePacksQueryOptions),
  head: () => ({
    meta: [
      {
        title: 'Bedrock Tweaks - Resource Packs',
      },
    ],
  }),
});

function ResourcePacks(): JSX.Element {
  const { data } = useResourcePacks();
  const downloadMutation = useDownloadResourcePacks();

  return (
    <Container py={'28'} px={{ base: '4', md: '8' }}>
      <Heading
        as={'h1'}
        size={'4xl'}
        fontWeight={'semibold'}
        textAlign={'center'}
        mb={8}
        color={'white'}
      >
        {'Resource Packs'}
      </Heading>
      <AdSense
        slot={ADSENSE_CONFIG.slots.resourcePacksTop}
        format={'auto'}
        responsive={true}
        style={{ display: 'block', marginBottom: '2rem' }}
      />
      <SectionPageLayout
        data={data}
        downloadMutation={downloadMutation}
      />
      <AdSense
        slot={ADSENSE_CONFIG.slots.resourcePacksBottom}
        format={'auto'}
        responsive={true}
        style={{ display: 'block', marginTop: '2rem' }}
      />
      <SectionPageFooter />
    </Container>
  );
}
