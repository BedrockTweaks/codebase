import { SectionPageFooter, SectionPageLayout } from '@/components/pack-selection';
import { craftingTweaksQueryOptions, useCraftingTweaks, useDownloadCraftingTweaks } from '@/hooks/api/useCraftingTweaks';
import { Container, Heading } from '@chakra-ui/react';
import { createFileRoute } from '@tanstack/react-router';
import { JSX } from 'react';

export const Route = createFileRoute('/crafting-tweaks')({
  component: CraftingTweaks,
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(craftingTweaksQueryOptions),
  staticData: {
    title: 'Bedrock Tweaks - Crafting Tweaks',
  },
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
      <SectionPageLayout
        data={data}
        downloadMutation={downloadMutation}
      />
      <SectionPageFooter />
    </Container>
  );
}
