import { usePackSelection } from '@/contexts/PackSelectionContext';
import { CategorySelection, DownloadRequest, SECTION_NAME_MAP } from '@/models';
import { Button, Input, Link } from '@/theming/components';
import { generatePackName } from '@/utils/packs';
import {
  Box,
  CloseButton,
  Flex,
  Heading,
  Image,
  Text,
  VStack,
} from '@chakra-ui/react';
import type { GeneratedPackResponse } from '@bt/types';
import { UseMutationResult } from '@tanstack/react-query';
import { JSX, useMemo, useState } from 'react';
import { toaster } from '../Toaster';

interface SelectedPacksProps {
  compatibleVersions: number[];
  onDownload: UseMutationResult<GeneratedPackResponse, Error, DownloadRequest>;
  onClose?: () => void;
}

export function SelectedPacks({ compatibleVersions, onDownload, onClose }: SelectedPacksProps): JSX.Element {
  const [packName, setPackName] = useState<string | undefined>();

  const { section, selectedPacks } = usePackSelection();

  const generatedPackName = useMemo(() => generatePackName(section, packName), [section, packName]);

  const handleDownload = (): void => {
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

    onDownload.mutate(request, {
      onSuccess: (response) => {
        const a = document.createElement('a');

        a.href = response.downloadUrl;
        a.download = new URL(response.downloadUrl).pathname.split('/').pop() ?? response.packName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        toaster.success({
          title: 'Download Started',
          description: 'Your pack is being downloaded.',
        });
      },
      onError: (error) => {
        toaster.error({
          title: 'Download Failed',
          description: error instanceof Error ? error.message : 'An unknown error occurred during download.',
        });
      },
    });
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
        <Flex
          bg={'primary.500'}
          px={5}
          py={3}
          borderTopRadius={'xl'}
          align={'center'}
          justify={'space-between'}
        >
          <Heading size={'lg'} color={'white'}>
            {`${SECTION_NAME_MAP[section]} Selector`}
          </Heading>
          {onClose && (
            <CloseButton
              onClick={onClose}
              color={'white'}
              size={'md'}
            />
          )}
        </Flex>

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

          <Button
            variant={'solid'}
            size={'lg'}
            width={'full'}
            disabled={!selectedPacks.length || onDownload.isPending}
            onClick={handleDownload}
          >
            {onDownload.isPending ? 'Downloading...' : 'Download'}
          </Button>
        </VStack>
      </VStack>

      <Link
        asChild
        target={'_blank'}
        rel={'noopener noreferrer'}
        display={'block'}
        width={'full'}
      >
        <a href={`https://bisecthosting.com/drav_dev?r=${generatedPackName.prefix}`}>
          <Image
            as={'img'}
            src={'https://www.bisecthosting.com/partners/custom-banners/36ed4925-a513-4942-a5d0-cfbf68400d8a.webp'}
            alt={'BisectHosting'}
            width={'full'}
            borderRadius={'md'}
          />
        </a>
      </Link>
    </Box>
  );
}
