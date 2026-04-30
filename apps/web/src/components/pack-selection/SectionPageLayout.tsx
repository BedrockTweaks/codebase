import { PackSelectionProvider } from '@/contexts/PackSelectionContext';
import { DownloadRequest, SectionResponse } from '@/models';
import type { GeneratedPackResponse } from '@bt/types';
import { Button } from '@/theming/components';
import {
  Box,
  DialogBackdrop,
  DialogBody,
  DialogContent,
  DialogPositioner,
  DialogRoot,
  Grid,
  GridItem,
  Portal,
} from '@chakra-ui/react';
import { UseMutationResult } from '@tanstack/react-query';
import { JSX, ReactNode, useState } from 'react';
import { CategoriesAccordion } from './CategoriesAccordion';
import { SelectedPacks } from './SelectedPacks';

interface SectionPageLayoutProps {
  data: SectionResponse;
  downloadMutation: UseMutationResult<GeneratedPackResponse, Error, DownloadRequest>;
  children?: ReactNode;
}

export function SectionPageLayout({ data, downloadMutation }: SectionPageLayoutProps): JSX.Element {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

      {/* Mobile floating download button */}
      <Box
        display={{ base: 'block', md: 'none' }}
        position={'fixed'}
        bottom={'24'}
        left={'4'}
        zIndex={'1000'}
      >
        <Button
          onClick={() => setIsDialogOpen(true)}
          size={'lg'}
          colorPalette={'primary'}
        >
          {'Download'}
        </Button>
      </Box>

      {/* Mobile dialog */}
      <DialogRoot open={isDialogOpen} onOpenChange={e => setIsDialogOpen(e.open)} placement={'center'}>
        <Portal>
          <DialogBackdrop />
          <DialogPositioner>
            <DialogContent bg={'transparent'}>
              <DialogBody>
                <SelectedPacks
                  compatibleVersions={data.version}
                  onDownload={downloadMutation}
                  onClose={() => setIsDialogOpen(false)}
                />
              </DialogBody>
            </DialogContent>
          </DialogPositioner>
        </Portal>
      </DialogRoot>
    </PackSelectionProvider>
  );
}
