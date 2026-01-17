import { AbsoluteCenter, Box, Flex, Image, Text } from '@chakra-ui/react';
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
      <Flex align={'center'} justifyContent={'space-between'} height={'full'} gap={{ base: '2', sm: '4' }} position={'relative'}>
        {/* Logo */}
        <Box display={'flex'} justifyContent={'center'} zIndex={'1'} w={{ base: 'auto', md: '20%' }}>
          <a href={'https://drav.dev'} style={{ display: 'flex' }}>
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

        {/* Title */}
        <AbsoluteCenter axis={'horizontal'}>
          <Text
            fontSize={{ base: '3xl', md: '4xl' }}
            fontWeight={'semibold'}
            color={'white'}
          >
            <Link to={'/'} variant={'nav'} _hover={{ textDecoration: 'none' }}>
              {'Bedrock Tweaks'}
            </Link>
          </Text>
        </AbsoluteCenter>

        {/* Navigation */}
        <Flex
          gap={{ base: '4', md: '8' }}
          align={'center'}
          color={'white'}
          zIndex={'1'}
        >
          <Link to={'/resource-packs'} variant={'nav'}>
            <Text hideBelow={'lg'}>{'Resource Packs'}</Text>
            <Text hideFrom={'lg'}>{'RP\'s'}</Text>
          </Link>
          <Link to={'/addons'} variant={'nav'}>
            <Text>{'Addons'}</Text>
          </Link>
          <Link to={'/crafting-tweaks'} variant={'nav'}>
            <Text hideBelow={'lg'}>{'Crafting Tweaks'}</Text>
            <Text hideFrom={'lg'}>{'CT\'s'}</Text>
          </Link>
        </Flex>
      </Flex>
    </Box>
  );
}
