import { AdSense } from '@bt/adsense';
import { SectionPageFooter, SectionPageLayout } from '@/components/pack-selection';
import { ADSENSE_CONFIG } from '@/config/adsense';
import { craftingTweaksQueryOptions, useCraftingTweaks, useDownloadCraftingTweaks } from '@/hooks/api/useCraftingTweaks';
import { Container, Heading } from '@chakra-ui/react';
import { createFileRoute } from '@tanstack/react-router';
import { JSX } from 'react';

export const Route = createFileRoute('/crafting-tweaks')({
  component: CraftingTweaks,
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(craftingTweaksQueryOptions),
  head: () => ({
    meta: [
      {
        title: 'Bedrock Tweaks - Crafting Tweaks',
      },
    ],
  }),
});

function CraftingTweaks(): JSX.Element {
  const { data } = useCraftingTweaks();
  const downloadMutation = useDownloadCraftingTweaks();

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
        {'Crafting Tweaks'}
      </Heading>
      <AdSense
        slot={ADSENSE_CONFIG.slots.craftingTweaksTop}
        responsive={true}
        style={{ display: 'block', marginBottom: '2rem' }}
      />
      <SectionPageLayout
        data={data}
        downloadMutation={downloadMutation}
      />
      <AdSense
        slot={ADSENSE_CONFIG.slots.craftingTweaksBottom}
        responsive={true}
        style={{ display: 'block', marginTop: '2rem' }}
      />
      <SectionPageFooter />
    </Container>
  );
}
