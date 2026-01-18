import { DownloadRequest, SectionResponse } from '@/models';
import { Box, Grid, GridItem } from '@chakra-ui/react';
import { UseMutationResult } from '@tanstack/react-query';
import { JSX, ReactNode } from 'react';
import { PackSelectionProvider } from '@/contexts/PackSelectionContext';
import { CategoriesAccordion } from './CategoriesAccordion';
import { SelectedPacks } from './SelectedPacks';

interface SectionPageLayoutProps {
  data: SectionResponse;
  downloadMutation: UseMutationResult<Blob, Error, DownloadRequest>;
  children?: ReactNode;
}

export function SectionPageLayout({ data, downloadMutation }: SectionPageLayoutProps): JSX.Element {
  return (
    <PackSelectionProvider categories={data.categories} section={data.section}>
      <Grid
        templateColumns={{ base: '1fr', md: '1fr 300px' }}
        gap={6}
      >
        {/* Accordion section */}
        <GridItem>
          <Box>
            <CategoriesAccordion categories={data.categories} />
          </Box>
        </GridItem>

        {/* Sidebar - desktop only */}
        <GridItem hideBelow={'md'}>
          <SelectedPacks compatibleVersions={data.version} onDownload={downloadMutation} />
        </GridItem>
      </Grid>

      {/* Mobile floating dialog button */}
      <Box display={{ base: 'block', lg: 'none' }}>
        {/* TODO */}
      </Box>
    </PackSelectionProvider>
  );
}
