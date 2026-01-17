import { Link } from '@/theming/components';
import { Flex, Text } from '@chakra-ui/react';
import { FaDiscord } from 'react-icons/fa';
import { JSX } from 'react';

export default function Footer(): JSX.Element {
  const currentYear = new Date().getFullYear();
  const version = import.meta.env.VITE_APP_VERSION;

  return (
    <Flex
      as={'footer'}
      bg={'black'}
      color={'white'}
      py={'4'}
      px={{ base: '4', sm: '8' }}
      justify={'center'}
      align={'center'}
    >
      <Flex
        direction={{ base: 'column', md: 'row' }}
        align={'center'}
        gap={{ base: '2', md: '0' }}
        fontWeight={'medium'}
      >
        <Flex align={'center'} gap={'2'}>
          <Text>
            {'© Bedrock Tweaks '}
            {currentYear}
          </Text>
          <Text>{'|'}</Text>
          <Text>{`v${version}`}</Text>
        </Flex>

        <Text mx={'2'} hideBelow={'md'}>
          {'|'}
        </Text>

        <Link to={'/privacy'} variant={'nav'}>
          {'Privacy Policy'}
        </Link>

        <Text mx={'2'} hideBelow={'md'}>
          {'|'}
        </Text>

        <Link to={'/terms'} variant={'nav'}>
          {'Terms and Conditions'}
        </Link>

        <Text mx={'2'} hideBelow={'md'}>
          {'|'}
        </Text>

        <Link asChild variant={'nav'} target={'_blank'} rel={'noopener noreferrer'}>
          <a href={'/discord'}>
            <FaDiscord size={20} />
          </a>
        </Link>
      </Flex>
    </Flex>
  );
}
