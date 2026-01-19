import { Link } from '@/theming/components';
import { Box, Container, Heading, Image, Text, VStack } from '@chakra-ui/react';
import { JSX } from 'react';

export function NotFoundPage(): JSX.Element {
  return (
    <Container py={'28'} maxW={'6xl'}>
      <VStack gap={'16'} align={'center'}>
        <Box w={{ base: 'full', sm: '400px', md: '500px' }}>
          <Image
            src={'/assets/images/logo-white.svg'}
            alt={'Bedrock Tweaks Logo'}
            w={'full'}
            h={'auto'}
          />
        </Box>

        <Box
          w={'full'}
          maxW={'xl'}
          bg={'linear-gradient(180deg, rgba(99, 0, 0, 0.6) 10%, rgba(99, 0, 0, 0) 30%)'}
          borderRadius={'3xl'}
          p={'1'}
        >
          <Box bg={'black'} borderRadius={'3xl'} p={{ base: '6', sm: '8', md: '12' }}>
            <VStack gap={'6'} align={'center'}>
              <Text fontSize={'4xl'} fontWeight={'bold'} color={'primary.500'}>
                {'404'}
              </Text>

              <Text color={'white'}>
                {'VITE_API_URL:'}
                {import.meta.env.VITE_API_URL ?? 'VITE_API_URL does not exist'}
              </Text>
              <Text color={'white'}>
                {'API_URL:'}
                {process.env.API_URL ?? 'API_URL does not exist'}
              </Text>

              <Heading as={'h1'} fontSize={{ base: '2xl', lg: '3xl' }} fontWeight={'bold'} color={'white'} textAlign={'center'}>
                {'Page Not Found'}
              </Heading>

              <Text fontSize={'lg'} color={'gray.400'} textAlign={'center'} mb={'4'}>
                {'The page you\'re looking for doesn\'t exist. Check out these sections instead:'}
              </Text>

              <VStack gap={'6'} w={'full'} textAlign={'center'}>
                <Link to={'/resource-packs'} variant={'nav'} w={'full'} fontSize={'xl'}>
                  {'Resource Packs'}
                </Link>

                <Link to={'/addons'} variant={'nav'} w={'full'} fontSize={'xl'}>
                  {'Addons'}
                </Link>

                <Link to={'/crafting-tweaks'} variant={'nav'} w={'full'} fontSize={'xl'}>
                  {'Crafting Tweaks'}
                </Link>
              </VStack>
            </VStack>
          </Box>
        </Box>
      </VStack>
    </Container>
  );
}

export function InternalServerErrorPage(): JSX.Element {
  return (
    <Container py={'28'} maxW={'6xl'}>
      <VStack gap={'16'} align={'center'}>
        <Box w={{ base: 'full', sm: '400px', md: '500px' }}>
          <Image
            src={'/assets/images/logo-white.svg'}
            alt={'Bedrock Tweaks Logo'}
            w={'full'}
            h={'auto'}
          />
        </Box>

        <Box
          w={'full'}
          maxW={'xl'}
          bg={'linear-gradient(180deg, rgba(99, 0, 0, 0.6) 10%, rgba(99, 0, 0, 0) 30%)'}
          borderRadius={'3xl'}
          p={'1'}
        >
          <Box bg={'black'} borderRadius={'3xl'} p={{ base: '6', sm: '8', md: '12' }} textAlign={'center'}>
            <VStack gap={'6'} align={'center'}>
              <Text fontSize={'4xl'} fontWeight={'bold'} color={'primary.500'}>
                {'500'}
              </Text>

              <Heading as={'h1'} fontSize={{ base: '2xl', lg: '3xl' }} fontWeight={'bold'} color={'white'}>
                {'Internal Server Error'}
              </Heading>

              <Text fontSize={'lg'} color={'gray.400'} mb={0}>
                {'Something went wrong on our end'}
              </Text>

              <Link to={'/discord'} variant={'nav'} w={'full'} fontSize={'xl'} target={'_blank'} rel={'noopener noreferrer'}>
                {'Please contact @drav0011'}
              </Link>
            </VStack>
          </Box>
        </Box>
      </VStack>
    </Container>
  );
}
