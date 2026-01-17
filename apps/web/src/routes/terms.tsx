import { Link } from '@/theming/components/link';
import { Box, Container, Heading, List, Text, VStack } from '@chakra-ui/react';
import { createFileRoute } from '@tanstack/react-router';
import { JSX } from 'react';

export const Route = createFileRoute('/terms')({ component: Terms });

function Terms(): JSX.Element {
  return (
    <Container py={'28'} px={{ base: '4', md: '8' }}>
      <VStack gap={'8'} align={'stretch'}>
        <Heading as={'h1'} fontSize={{ base: '3xl', md: '4xl' }} color={'white'}>
          {'Terms and Conditions'}
        </Heading>

        <Box bg={'black'} p={{ base: '6', md: '8' }} borderRadius={'2xl'} color={'white'}>
          <VStack gap={'6'} align={'stretch'}>
            <Box>
              <Heading as={'h3'} fontSize={{ base: 'xl', md: '2xl' }} mb={'3'}>
                {'About Bedrock Tweaks permissions'}
              </Heading>
              <VStack gap={'3'} align={'stretch'}>
                <Text>
                  {'This project falls under Vanilla Tweaks use terms, as it is stated on those, Bedrock Tweaks completely remade most packs available in Vanilla Tweaks for them to be compatible with Minecraft "Bedrock".'}
                </Text>
                <Text>
                  {'Bedrock Tweaks only uses the assets and ideas from Vanilla Tweaks so the final user has the most similar experience as it they were using Vanilla Tweaks on Minecraft: Java Edition.'}
                </Text>
                <Text>
                  {'Bedrock Tweaks uses ads by Google Adsense to pay for the expenses of hosting, working and updating the site.'}
                </Text>
              </VStack>
            </Box>

            <Box>
              <Heading as={'h3'} fontSize={{ base: 'xl', md: '2xl' }} mb={'3'}>
                {'Regarding using Bedrock Tweaks in your own projects'}
              </Heading>
              <VStack gap={'3'} align={'stretch'}>
                <Text>
                  {'Bedrock Tweaks has the same terms as Vanilla Tweaks slightly modified.'}
                </Text>
                <Text>
                  {'Vanilla Tweaks terms: '}
                  <Link asChild target={'_blank'} rel={'noopener noreferrer'}>
                    <a href={'https://vanillatweaks.net/terms/'}>
                      {'https://vanillatweaks.net/terms/'}
                    </a>
                  </Link>
                </Text>
                <Text>
                  {'It is perfectly fine for anyone to use, modify and share our packs within their projects for the betterment of the community.'}
                </Text>
                <Text>
                  {'However, you may only do so if it does not infringe on the following terms and conditions:'}
                </Text>
              </VStack>
            </Box>

            <Box>
              <Heading as={'h3'} fontSize={{ base: 'xl', md: '2xl' }} mb={'3'}>
                {'Section 1 - Terms'}
              </Heading>
              <VStack gap={'4'} align={'stretch'}>
                <Box>
                  <Text fontWeight={'semibold'} mb={'2'}>
                    {'You cannot:'}
                  </Text>
                  <List.Root ps={'6'} spaceY={'2'}>
                    <List.Item>{'redistribute our tweaks as they are, without proper modification and/or additions.'}</List.Item>
                    <List.Item>{'restrict access or sell any pack that includes our tweaks through donations and/or a paywall.'}</List.Item>
                    <List.Item>{'distribute our tweaks without appropriate credit (listed below).'}</List.Item>
                  </List.Root>
                </Box>
                <Box>
                  <Text fontWeight={'semibold'} mb={'2'}>
                    {'You can:'}
                  </Text>
                  <List.Root ps={'6'} spaceY={'2'}>
                    <List.Item>{'distribute your pack with our tweaks, as long as your pack includes proper modification and/or additions.'}</List.Item>
                    <List.Item>{'distribute your pack with our tweaks, as long as you have appropriately credited Vanilla Tweaks and Bedrock Tweaks (listed below).'}</List.Item>
                    <List.Item>{'distribute your pack with our tweaks, as long as it is free to use for the community.'}</List.Item>
                  </List.Root>
                </Box>
              </VStack>
            </Box>

            <Box>
              <Heading as={'h3'} fontSize={{ base: 'xl', md: '2xl' }} mb={'3'}>
                {'Section 2 - Credits'}
              </Heading>
              <VStack gap={'3'} align={'stretch'}>
                <Text>
                  {'Include the below text on all main publishing platforms that you may use. (Minecraft Forum, Planet Minecraft, Minecraft Maps, Curseforge, MCPEDL, etc.).'}
                </Text>
                <Text>
                  {'You must create a credits.txt within your project that includes the below text.'}
                </Text>
                <Box bg={'white'} color={'gray.900'} p={'4'} borderRadius={'lg'} fontFamily={'monospace'}>
                  <Text>{'Credits:'}</Text>
                  <Text>{'Vanilla Tweaks: https://vanillatweaks.net/'}</Text>
                  <Text>{'Bedrock Tweaks: https://bedrocktweaks.net/'}</Text>
                </Box>
                <Text>
                  {'Bedrock Tweaks is not affiliated or made by Vanilla Tweaks. This is a fan made learning project developed by DrAv0011.'}
                </Text>
              </VStack>
            </Box>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
}
