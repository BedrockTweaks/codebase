import { Link } from '@/theming/components';
import { Box, Text } from '@chakra-ui/react';
import { JSX } from 'react';

export function SectionPageFooter(): JSX.Element {
  return (
    <Box
      bg={'black'}
      borderRadius={'xl'}
      p={'6'}
      mt={'8'}
      color={'gray.100'}
    >
      <Text mb={'4'}>
        {'Special thanks to all the contributors! You can find them here: '}
        <Link
          asChild
          variant={'link'}
          target={'_blank'}
          rel={'noopener noreferrer'}
        >
          <a href={'/github'}>
            {'GitHub Contributors'}
          </a>
        </Link>
      </Text>

      <Text>
        {'For Bugs, Updates, Requests or any issue regarding Bedrock Tweaks: '}
        <Link
          asChild
          variant={'link'}
          target={'_blank'}
          rel={'noopener noreferrer'}
        >
          <a href={'/discord'}>
            {'Join the Discord'}
          </a>
        </Link>
      </Text>
    </Box>
  );
}
