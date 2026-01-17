import { Link } from '@/theming/components';
import { Box, Container, Heading, List, Text, VStack } from '@chakra-ui/react';
import { createFileRoute } from '@tanstack/react-router';
import { JSX } from 'react';

export const Route = createFileRoute('/privacy')({
  component: Privacy,
  staticData: {
    title: 'Bedrock Tweaks - Privacy Policy',
  },
});

function Privacy(): JSX.Element {
  return (
    <Container py={'28'} px={{ base: '4', md: '8' }}>
      <VStack gap={'8'} align={'stretch'}>
        <Heading as={'h1'} fontSize={{ base: '3xl', md: '4xl' }} color={'white'}>
          {'Privacy Policy'}
        </Heading>

        <Box bg={'black'} p={{ base: '6', md: '8' }} borderRadius={'2xl'} color={'white'}>
          <VStack gap={'6'} align={'stretch'}>
            <Box>
              <Heading as={'h3'} fontSize={{ base: 'xl', md: '2xl' }} mb={'3'}>
                {'Bedrock Tweaks Privacy Policy'}
              </Heading>
              <Text>
                {'At '}
                <Link to={'/'}>
                  {'https://bedrocktweaks.net'}
                </Link>
                {', we take the privacy and security of our visitors very seriously. This Privacy Policy outlines the types of personal information we collect, how we use that information, and the measures we take to protect your information.'}
              </Text>
            </Box>

            <Box>
              <Heading as={'h3'} fontSize={{ base: 'xl', md: '2xl' }} mb={'3'}>
                {'Information We Collect'}
              </Heading>
              <Text>
                {'When you visit our website, we may collect certain information about you, including your IP address, browser type and version, operating system, and other technical information. We may also collect information about your use of our website, such as the pages you visit, the links you click, and the duration of your visit.'}
              </Text>
            </Box>

            <Box>
              <Heading as={'h3'} fontSize={{ base: 'xl', md: '2xl' }} mb={'3'}>
                {'Use Of Information'}
              </Heading>
              <VStack gap={'3'} align={'stretch'}>
                <Text>
                  {'We use the information we collect to improve our website and provide a better user experience to our visitors. We may also use the information for the following purposes:'}
                </Text>
                <List.Root ps={'6'} spaceY={'2'}>
                  <List.Item>{'To analyze traffic and usage patterns on our website'}</List.Item>
                  <List.Item>{'To diagnose and fix technical issues'}</List.Item>
                  <List.Item>{'To prevent fraud and protect our website from security threats'}</List.Item>
                  <List.Item>{'To comply with legal obligations and respond to lawful requests from authorities'}</List.Item>
                </List.Root>
                <Text>
                  {'We use Google AdSense to display ads on our website. Google AdSense may use cookies and other tracking technologies to collect information about your use of our website and other websites. This information may be used to personalize your experience, analyze traffic and usage patterns, and serve targeted advertising.'}
                </Text>
                <Text>
                  {'More information about Google\'s Privacy & Terms at '}
                  <Link asChild target={'_blank'} rel={'noopener noreferrer'}>
                    <a href={'https://policies.google.com/technologies/partner-sites'}>
                      {'https://policies.google.com/technologies/partner-sites'}
                    </a>
                  </Link>
                </Text>
              </VStack>
            </Box>

            <Box>
              <Heading as={'h3'} fontSize={{ base: 'xl', md: '2xl' }} mb={'3'}>
                {'Security'}
              </Heading>
              <Text>
                {'We take reasonable measures to protect the personal information we collect from unauthorized access, use, and disclosure. However, no security measures are perfect or impenetrable, and we cannot guarantee the security of your information.'}
              </Text>
            </Box>

            <Box>
              <Heading as={'h3'} fontSize={{ base: 'xl', md: '2xl' }} mb={'3'}>
                {'Cookies And Tracking Technologies'}
              </Heading>
              <Text>
                {'We may use cookies and other tracking technologies to collect information about your use of our website. This information may be used to personalize your experience, analyze traffic and usage patterns, and serve targeted advertising. You can choose to disable cookies or other tracking technologies in your browser settings. However, this may limit your ability to use certain features of our website.'}
              </Text>
            </Box>

            <Box>
              <Heading as={'h3'} fontSize={{ base: 'xl', md: '2xl' }} mb={'3'}>
                {'Children\'s Privacy'}
              </Heading>
              <Text>
                {'Our website is not intended for children under the age of 13. We do not knowingly collect or solicit personal information from children under the age of 13.'}
              </Text>
            </Box>

            <Box>
              <Heading as={'h3'} fontSize={{ base: 'xl', md: '2xl' }} mb={'3'}>
                {'GDPR'}
              </Heading>
              <VStack gap={'3'} align={'stretch'}>
                <Text>
                  {'If you are located in the European Union, you have certain rights under the General Data Protection Regulation (GDPR). These rights include the right to access, rectify, and erase your personal information, as well as the right to restrict or object to certain types of processing.'}
                </Text>
                <Text>
                  {'If you wish to exercise any of these rights, please contact us using the information provided below. We will respond to your request as soon as possible and no later than 30 days from the date of receipt of the request.'}
                </Text>
              </VStack>
            </Box>

            <Box>
              <Heading as={'h3'} fontSize={{ base: 'xl', md: '2xl' }} mb={'3'}>
                {'Changes To This Privacy Policy'}
              </Heading>
              <Text>
                {'We may update this Privacy Policy from time to time to reflect changes in our practices or legal obligations. We encourage you to check this page periodically for updates.'}
              </Text>
            </Box>

            <Text>
              {'If you have any questions or concerns about our Privacy Policy, please contact us at '}
              <Link asChild>
                <a href={'mailto:contact@bedrocktweaks.net'}>
                  {'contact@bedrocktweaks.net'}
                </a>
              </Link>
            </Text>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
}
