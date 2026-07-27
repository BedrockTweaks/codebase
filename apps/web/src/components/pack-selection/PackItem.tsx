import { usePackSelection } from '@/contexts';
import { Pack, SEVERITY_COLOR_MAP } from '@/models';
import { getApiUrl } from '@/utils/api';
import { Box, Image, Text, VStack } from '@chakra-ui/react';
import { JSX } from 'react';

function getPackIconUrl(section: string, categoryId: string, packId: string, extension: 'png' | 'gif'): string {
  // Convert section format: 'resource-packs' -> 'resource_packs'
  const sectionPath = section.replace(/-/g, '_');

  return `${getApiUrl(true)}/static/${sectionPath}/files/${categoryId}/${packId}/pack_icon.${extension}`;
}

interface PackItemProps {
  pack: Pack;
  categoryId: string;
  /** Eager load the icon: only worth it for categories open on first paint. */
  eager?: boolean;
}

export function PackItem({ pack, categoryId, eager }: PackItemProps): JSX.Element {
  const { isSelected, togglePack, section } = usePackSelection();

  const selected = isSelected(categoryId, pack.id);

  const handleClick = (): void => {
    if (pack.disabled) {
      return;
    }

    togglePack(categoryId, pack.id);
  };

  // Resolved server-side, so the browser asks for the right extension once. Undefined
  // means the pack ships no icon at all; the 90px box is still reserved so a missing
  // icon does not reflow the grid.
  const iconUrl = pack.iconExtension
    ? getPackIconUrl(section, categoryId, pack.id, pack.iconExtension)
    : undefined;

  return (
    // asChild rather than as={'button'}: a real <button> is focusable and
    // keyboard-operable, and Chakra's polymorphic `as` does not accept `type`.
    // aria-disabled instead of disabled keeps the card discoverable by screen
    // readers, which is the point of the visual "disabled" overlay.
    <Box
      asChild
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
      _focusVisible={{
        outline: '2px solid',
        outlineColor: 'primary.300',
        outlineOffset: '2px',
      }}
    >
      <button
        type={'button'}
        onClick={handleClick}
        aria-pressed={selected}
        aria-disabled={pack.disabled}
      >
        {/* A <button> only admits phrasing content, so everything inside is a span;
            they are flex items either way, which blockifies them. */}
        <VStack as={'span'} gap={1} alignItems={'center'}>
          <Box as={'span'} display={'block'} position={'relative'} boxSize={'90px'}>
            {iconUrl && (
              <Image
                src={iconUrl}
                alt={`${pack.name} icon`}
                w={'90px'}
                h={'90px'}
                objectFit={'cover'}
                loading={eager ? 'eager' : 'lazy'}
              />
            )}

            {pack.disabled && (
              <Image
                src={'/assets/images/disabled_overlay.png'}
                alt={''}
                position={'absolute'}
                top={0}
                left={0}
                w={'90px'}
                h={'90px'}
              />
            )}
          </Box>

          <Text as={'span'} fontWeight={'semibold'} opacity={pack.disabled ? 0.7 : 1} color={'white'}>
            {pack.name}
          </Text>

          <Text as={'span'} fontSize={'sm'} opacity={pack.disabled ? 0.7 : 1} color={'white'}>
            {pack.description}
          </Text>

          {pack.message && (
            <Text
              as={'span'}
              fontSize={'xs'}
              opacity={pack.disabled ? 0.7 : 1}
              color={SEVERITY_COLOR_MAP[pack.message.severity]}
              dangerouslySetInnerHTML={{ __html: pack.message.text }}
            />
          )}
        </VStack>

        <Text
          as={'span'}
          fontSize={'xs'}
          opacity={pack.disabled ? 0.7 : 1}
          color={'white'}
        >
          {pack.version}
        </Text>
      </button>
    </Box>
  );
}
