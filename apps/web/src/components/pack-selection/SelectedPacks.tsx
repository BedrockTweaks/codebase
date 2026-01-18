import { usePackSelection } from '@/contexts/PackSelectionContext';
import { CategorySelection, DownloadRequest, SECTION_NAME_MAP } from '@/models';
import { Button, Input } from '@/theming/components';
import { generatePackName } from '@/utils/packs';
import {
  Box,
  DownloadTrigger,
  Group,
  Heading,
  Text,
  VStack,
} from '@chakra-ui/react';
import { UseMutationResult } from '@tanstack/react-query';
import { Share } from 'lucide-react';
import { JSX, useMemo, useState } from 'react';
import { toaster } from '../Toaster';

interface SelectedPacksProps {
  compatibleVersions: number[];
  onDownload: UseMutationResult<Blob, Error, DownloadRequest>;
}

export function SelectedPacks({ compatibleVersions, onDownload }: SelectedPacksProps): JSX.Element {
  const [packName, setPackName] = useState<string | undefined>();

  const { section, selectedPacks } = usePackSelection();

  const generatedPackName = useMemo(() => generatePackName(section, packName), [section, packName]);

  const handleDownloadData = async (): Promise<Blob> => {
    if (!generatedPackName.isValid) {
      toaster.error({
        title: 'Invalid Pack Name',
        description: 'Your pack name contains invalid characters. We only support ASCII characters. Downloading with a default name instead.',
      });
    }

    const categories: CategorySelection[] = selectedPacks.map(category => ({
      id: category.id,
      packs: category.packs.map(p => p.id),
    }));

    const request: DownloadRequest = {
      name: generatedPackName.packName,
      categories,
    };

    return new Promise((resolve, reject) => {
      onDownload.mutate(request, {
        onSuccess: (blob) => {
          resolve(blob);
        },
        onError: (error) => {
          toaster.error({
            title: 'Download Failed',
            description: error instanceof Error ? error.message : 'An unknown error occurred during download.',
          });
          reject(error);
        },
      });
    });
  };

  const handleShare = async (): Promise<void> => {
    if (!navigator.share) {
      toaster.error({
        title: 'Share Not Supported',
        description: 'Your browser does not support the share feature.',
      });

      return;
    }

    try {
      const blob = await handleDownloadData();
      const file = new File([blob], generatedPackName.fileName, { type: 'application/octet-stream' });

      await navigator.share({
        files: [file],
        title: generatedPackName.packName,
      });
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        toaster.error({
          title: 'Share Failed',
          description: error.message,
        });
      }
    }
  };

  return (
    <Box
      bg={'black'}
      borderRadius={'xl'}
      overflow={'hidden'}
      position={'sticky'}
      top={24}
    >
      <VStack align={'stretch'} gap={0}>
        {/* Header */}
        <Box
          bg={'primary.500'}
          px={5}
          py={3}
          borderTopRadius={'xl'}
        >
          <Heading size={'lg'} color={'white'}>
            {`${SECTION_NAME_MAP[section]} Selector`}
          </Heading>
        </Box>

        {/* Scrollable list */}
        <Box
          maxH={'20rem'}
          overflowY={'auto'}
          px={5}
          py={3}
        >
          {!selectedPacks.length
            ? (
                <Text color={'white'} fontSize={'sm'}>
                  {'Choose all the packs you want and then press download!'}
                </Text>
              )
            : (
                <VStack align={'stretch'} gap={3}>
                  {selectedPacks.map(category => (
                    <Box key={category.id}>
                      <Text
                        fontSize={'lg'}
                        fontWeight={'medium'}
                        color={'white'}
                        mb={1}
                      >
                        {category.name}
                      </Text>

                      <Box
                        as={'ul'}
                        pl={5}
                        color={'gray.300'}
                      >
                        {category.packs.map(pack => (
                          <Box
                            as={'li'}
                            key={pack.id}
                            mb={1}
                          >
                            {pack.name}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  ))}
                </VStack>
              )}
        </Box>

        {/* Footer with input and button */}
        <VStack
          align={'stretch'}
          gap={2}
          px={5}
          py={3}
        >
          <Input
            value={packName}
            onChange={e => setPackName(e.target.value)}
            placeholder={'Enter pack name'}
            variant={'outline'}
          />

          <Text color={'white'}>
            {`Compatible versions: ${compatibleVersions.toString().replace(/,/g, '.')}+`}
          </Text>

          <Group attached>
            <DownloadTrigger
              data={handleDownloadData}
              fileName={generatedPackName.fileName}
              mimeType={'application/octet-stream'}
              asChild
            >
              <Button
                variant={'solid'}
                size={'lg'}
                width={'full'}
                disabled={!selectedPacks.length || onDownload.isPending}
              >
                {onDownload.isPending ? 'Downloading...' : 'Download'}
              </Button>
            </DownloadTrigger>

            <Button
              variant={'solid'}
              size={'lg'}
              onClick={handleShare}
              disabled={!selectedPacks.length || onDownload.isPending}
              display={{ base: 'flex', md: 'none' }}
              aria-label={'Share pack'}
            >
              <Share size={20} />
            </Button>
          </Group>
        </VStack>
      </VStack>
    </Box>
  );
}
