import { useCraftingTweaks } from '@/hooks/api/useCraftingTweaks';
import { useResourcePacks } from '@/hooks/api/useResourcePacks';
import { Section, type Category, type Pack } from '@/models';
import { Link } from '@/theming/components';
import { getApiUrl } from '@/utils/api';
import { Circle, Flex, Grid, GridItem, Heading, Image, SimpleGrid, Stack, Text, VStack } from '@chakra-ui/react';
import { createFileRoute } from '@tanstack/react-router';
import { JSX, useEffect, useState } from 'react';
import { FaDiscord, FaGithub } from 'react-icons/fa';

export const Route = createFileRoute('/')({
  component: Landing,
  head: () => ({
    meta: [
      {
        title: 'Bedrock Tweaks',
      },
    ],
  }),
});

function Landing(): JSX.Element {
  const { data: rpData } = useResourcePacks();
  // const { data: addonsData } = useAddons();
  const { data: ctData } = useCraftingTweaks();

  const [rpImage, setRpImage] = useState<string>('');
  const [ctImage, setCtImage] = useState<string>('');

  useEffect(() => {
    if (!rpData && !ctData) {
      return;
    }

    const timeout = setTimeout(() => {
      if (rpData) {
        setRpImage(getRandomImage(rpData.categories, Section.ResourcePacks));
      }

      if (ctData) {
        setCtImage(getRandomImage(ctData.categories, Section.CraftingTweaks));
      }
    }, 0);

    return (): void => clearTimeout(timeout);
  }, [rpData, ctData]);

  return (
    <Grid templateColumns={{ base: '1fr', md: '1fr 2fr 1fr' }} gap={'0'} pt={'20'} pb={'auto'}>
      {/* Left Ad Column - Hidden on mobile */}
      <GridItem hideBelow={'md'}>
        <Flex justify={'center'} align={'start'} p={'4'}>
          {/* Ad space */}
        </Flex>
      </GridItem>

      {/* Main Content */}
      <GridItem>
        <VStack gap={'8'} py={'10'} px={'4'}>
          {/* Logo */}
          <Image src={'/assets/images/logo-white.svg'} alt={'Bedrock Tweaks'} maxW={'full'} my={'5'} />

          {/* Title and Subtitle */}
          <VStack gap={'4'} textAlign={'center'}>
            <Heading as={'h1'} fontSize={{ base: '3xl', md: '4xl' }} fontWeight={'medium'} lineHeight={'normal'} color={'white'}>
              {'A Complete Unofficial Port of Vanilla Tweaks to Minecraft Bedrock Edition'}
            </Heading>
            <Heading as={'h2'} fontSize={{ base: '2xl', md: '3xl' }} color={'white'} fontWeight={'normal'}>
              {'Official Website: '}
              <Link asChild variant={'underline'} target={'_blank'} rel={'noopener noreferrer'}>
                <a href={'https://vanillatweaks.net'}>
                  {'Vanilla Tweaks'}
                </a>
              </Link>
            </Heading>
          </VStack>

          {/* Three Sections Grid */}
          <SimpleGrid columns={{ base: 1, sm: 3 }} gap={{ base: '12', sm: '6' }} w={'full'} mt={'8'} textAlign={'center'}>
            {/* Resource Packs */}
            <VStack align={'center'} justify={'space-between'}>
              <Link to={'/resource-packs'} variant={'underline'} fontSize={{ base: 'xl', md: '2xl' }}>
                {'Resource Packs'}
              </Link>
              {rpImage && (
                <Link to={'/resource-packs'}>
                  <Image
                    src={rpImage}
                    alt={'Resource Pack'}
                    boxSize={'24'}
                    objectFit={'contain'}
                    cursor={'pointer'}
                  />
                </Link>
              )}
            </VStack>

            {/* Addons */}
            <VStack align={'center'} justify={'space-between'}>
              <VStack gap={'2'}>
                <Link to={'/addons'} variant={'underline'} fontSize={{ base: 'xl', md: '2xl' }}>
                  {'Addons'}
                </Link>
                <Text fontSize={{ base: 'base', md: 'lg' }} color={'white'}>
                  {'Equivalent to Java Data Packs'}
                </Text>
              </VStack>
              {/* {addonsImage && (
                <Link to={'/addons'}>
                  <Image
                    src={addonsImage}
                    alt={'Addon'}
                    boxSize={'24'}
                    objectFit={'contain'}
                    cursor={'pointer'}
                  />
                </Link>
              )} */}
              <Link to={'/addons'}>
                <Image
                  src={'assets/images/soontm.webp'}
                  alt={'Addon'}
                  boxSize={'24'}
                  objectFit={'contain'}
                  cursor={'pointer'}
                />
              </Link>
            </VStack>

            {/* Crafting Tweaks */}
            <VStack align={'center'} justify={'space-between'}>
              <Link to={'/crafting-tweaks'} variant={'underline'} fontSize={{ base: 'xl', md: '2xl' }}>
                {'Crafting Tweaks'}
              </Link>
              {ctImage && (
                <Link to={'/crafting-tweaks'}>
                  <Image
                    src={ctImage}
                    alt={'Crafting Tweak'}
                    boxSize={'24'}
                    objectFit={'contain'}
                    cursor={'pointer'}
                  />
                </Link>
              )}
            </VStack>
          </SimpleGrid>

          {/* Discord and GitHub Links */}
          <Stack gap={'5'} mt={'10'} align={'center'}>
            <Link asChild variant={'underline'} target={'_blank'} rel={'noopener noreferrer'}>
              <a href={'/discord'}>
                <Flex align={'center'} gap={'2'}>
                  <Text fontSize={{ base: 'lg', md: 'xl' }}>{'Join the Discord!'}</Text>
                  <Circle size={'10'} bg={'black'}>
                    <FaDiscord size={24} color={'white'} />
                  </Circle>
                </Flex>
              </a>
            </Link>
            <Link asChild variant={'underline'} target={'_blank'} rel={'noopener noreferrer'}>
              <a href={'/github'}>
                <Flex align={'center'} gap={'2'}>
                  <Text fontSize={{ base: 'lg', md: 'xl' }}>{'Contribute in GitHub!'}</Text>
                  <Circle size={'10'} bg={'black'}>
                    <FaGithub size={24} color={'white'} />
                  </Circle>
                </Flex>
              </a>
            </Link>
          </Stack>
        </VStack>
      </GridItem>

      {/* Right Ad Column - Hidden on mobile */}
      <GridItem hideBelow={'md'}>
        <Flex justify={'center'} align={'start'} p={'4'}>
          {/* Ad space */}
        </Flex>
      </GridItem>
    </Grid>
  );
}

function getRandomImage(categories: Category[], section: Section): string {
  if (categories.length === 0) {
    return '';
  }

  const randomCategoryIndex = Math.floor(Math.random() * categories.length);
  const selectedCategory = categories[randomCategoryIndex];

  if (selectedCategory && selectedCategory.packs.length > 0) {
    const randomPackIndex = Math.floor(Math.random() * selectedCategory.packs.length);
    const selectedPack: Pack = selectedCategory.packs[randomPackIndex];

    return `${getApiUrl()}/static/${section}/files/${selectedCategory.id}/${selectedPack.id}/pack_icon.png`;
  }

  return '';
}
