import { Link } from '@/theming/components';
import { Box, Circle, Flex, Image, Text } from '@chakra-ui/react';
import { createFileRoute } from '@tanstack/react-router';
import { JSX } from 'react';
import { FaDiscord } from 'react-icons/fa';

export const Route = createFileRoute('/addons')({
  component: Addons,
  staticData: {
    title: 'Bedrock Tweaks - Addons',
  },
});

function Addons(): JSX.Element {
  return (
    <Box
      display={'flex'}
      flexDirection={'column'}
      alignItems={'center'}
      justifyContent={'center'}
      minHeight={'60vh'}
      px={{ base: 4, md: 8 }}
    >
      <Box
        maxWidth={'4xl'}
        width={'100%'}
        p={{ base: 8, md: 12 }}
        textAlign={'center'}
        bg={'gray.800'}
        borderRadius={'2xl'}
      >
        <Box mb={6}>
          <Image
            src={'/assets/images/soontm.webp'}
            alt={'Coming Soon'}
            maxWidth={{ base: '300px', md: '400px' }}
            mx={'auto'}
          />
        </Box>
        <Text fontSize={{ base: 'lg', md: 'xl' }} color={'white'} mb={6}>
          {'We\'re working hard to bring you the best addons for Minecraft Bedrock. Stay tuned!'}
        </Text>

        <Link asChild variant={'underline'} target={'_blank'} rel={'noopener noreferrer'}>
          <a href={'/discord'}>
            <Flex align={'center'} gap={'2'} justify={'center'}>
              <Text color={'white'} fontSize={{ base: 'md', md: 'lg' }}>{'You can get more news in the Discord!'}</Text>
              <Circle size={'10'} bg={'black'}>
                <FaDiscord size={24} color={'white'} />
              </Circle>
            </Flex>
          </a>
        </Link>
      </Box>
    </Box>
  );
}
