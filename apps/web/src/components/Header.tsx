import { Box, Flex, Image, Text } from '@chakra-ui/react';
import { Link } from '@/theming/components';
import { JSX } from 'react';

export default function Header(): JSX.Element {
  return (
    <Box
      as={'header'}
      position={'fixed'}
      height={'5rem'}
      zIndex={'sticky'}
      left={'0'}
      top={'0'}
      width={'full'}
      px={{ base: '2', sm: '8' }}
      bg={'black'}
    >
      <Flex align={'center'} height={'full'} gap={{ base: '2', sm: '4' }}>
        {/* Logo Section */}
        <Box width={'auto'}>
          <a href={'https://drav.dev'}>
            <Image
              src={'/assets/images/drav_dev-white.svg'}
              alt={'drav_dev'}
              height={'10'}
              hideBelow={'md'}
            />
            <Image
              src={'/assets/images/drav-white.svg'}
              alt={'drav_dev'}
              height={'10'}
              hideFrom={'md'}
            />
          </a>
        </Box>

        {/* Title Section */}
        <Box flex={'1'} textAlign={'center'}>
          <Text
            fontSize={{ base: '2xl', md: '4xl' }}
            fontWeight={'semibold'}
            color={'white'}
          >
            <Link to={'/'} variant={'nav'} _hover={{ textDecoration: 'none' }}>
              {'Bedrock Tweaks'}
            </Link>
          </Text>
        </Box>

        {/* Navigation Menu */}
        <Flex
          gap={{ base: '2', sm: '5' }}
          align={'center'}
          color={'white'}
          fontSize={{ base: 'sm', lg: 'md' }}
        >
          <Link to={'/resource-packs'} variant={'nav'}>
            <Text hideBelow={'lg'}>{'Resource Packs'}</Text>
            <Text hideFrom={'lg'}>{'RP'}</Text>
          </Link>
          <Link to={'/addons'} variant={'nav'}>
            <Text>{'Addons'}</Text>
          </Link>
          <Link to={'/crafting-tweaks'} variant={'nav'}>
            <Text hideBelow={'lg'}>{'Crafting Tweaks'}</Text>
            <Text hideFrom={'lg'}>{'CT'}</Text>
          </Link>
        </Flex>
      </Flex>
    </Box>
  );
}
