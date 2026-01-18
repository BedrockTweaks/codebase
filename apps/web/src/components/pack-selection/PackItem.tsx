import { usePackSelection } from '@/contexts';
import { Pack, SEVERITY_COLOR_MAP } from '@/models';
import { Box, Image, Text, VStack } from '@chakra-ui/react';
import { JSX, useState } from 'react';

function getPackIconUrl(section: string, categoryId: string, packId: string, extension: 'png' | 'gif' = 'png'): string {
  const apiUrl = import.meta.env.VITE_API_URL || '';

  // Convert section format: 'resource-packs' -> 'resource_packs'
  const sectionPath = section.replace(/-/g, '_');

  return `${apiUrl}/static/${sectionPath}/files/${categoryId}/${packId}/pack_icon.${extension}`;
}

interface PackItemProps {
  pack: Pack;
  categoryId: string;
}

export function PackItem({ pack, categoryId }: PackItemProps): JSX.Element {
  const { isSelected, togglePack, section } = usePackSelection();
  const [iconExtension, setIconExtension] = useState<'png' | 'gif'>('png');

  const selected = isSelected(categoryId, pack.id);

  const handleClick = (): void => {
    if (pack.disabled) {
      return;
    }

    togglePack(categoryId, pack.id);
  };

  const handleImageError = (): void => {
    if (iconExtension === 'png') {
      setIconExtension('gif');
    }
  };

  const iconUrl = getPackIconUrl(section, categoryId, pack.id, iconExtension);

  return (
    <Box
      onClick={handleClick}
      cursor={pack.disabled ? 'not-allowed' : 'pointer'}
      borderWidth={'3px'}
      borderRadius={'2xl'}
      p={3}
      display={'flex'}
      flexDirection={'column'}
      alignItems={'center'}
      justifyContent={'space-between'}
      textAlign={'center'}
      w={'full'}
      h={'full'}
      gap={1}
      transition={'all 0.2s'}
      bg={pack.disabled ? 'gray.950' : selected ? 'gray.500' : 'gray.850'}
      borderColor={pack.disabled ? 'gray.950' : selected ? 'gray.850' : 'gray.850'}
      _hover={{
        bg: pack.disabled ? 'gray.950' : selected ? 'gray.600' : 'gray.800',
        borderColor: pack.disabled ? 'gray.950' : selected ? 'gray.850' : 'gray.800',
      }}
    >
      <VStack gap={1} alignItems={'center'}>
        <Box position={'relative'} w={'90px'}>
          <Image
            src={iconUrl}
            alt={'pack icon'}
            w={'90px'}
            h={'90px'}
            objectFit={'cover'}
            loading={'eager'}
            onError={handleImageError}
          />

          {pack.disabled && (
            <Image
              src={'/assets/images/disabled_overlay.png'}
              alt={'disabled overlay'}
              position={'absolute'}
              top={0}
              left={0}
              w={'90px'}
              h={'90px'}
            />
          )}
        </Box>

        <Text fontWeight={'semibold'} opacity={pack.disabled ? 0.7 : 1} color={'white'}>
          {pack.name}
        </Text>

        <Text fontSize={'sm'} opacity={pack.disabled ? 0.7 : 1} color={'white'}>
          {pack.description}
        </Text>

        {pack.message && (
          <Text
            fontSize={'xs'}
            opacity={pack.disabled ? 0.7 : 1}
            color={SEVERITY_COLOR_MAP[pack.message.severity]}
            dangerouslySetInnerHTML={{ __html: pack.message.text }}
          />
        )}
      </VStack>

      <Text
        fontSize={'xs'}
        opacity={pack.disabled ? 0.7 : 1}
        color={'white'}
      >
        {pack.version}
      </Text>
    </Box>
  );
}
