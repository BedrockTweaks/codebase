import { accordionAnatomy } from '@chakra-ui/react/anatomy';
import { defineSlotRecipe } from '@chakra-ui/react';

export const accordionSlotRecipe = defineSlotRecipe({
  slots: accordionAnatomy.keys(),
  base: {
    root: {
      borderRadius: '2xl',
      bg: 'gray.700',
      gap: '2',
    },
    item: {
      pb: '4',
      bg: 'transparent',
      border: '0',
      borderBottomWidth: '0',
    },
    itemTrigger: {
      borderRadius: 'xl',
      bg: 'gray.900',
      color: 'white',
      fontWeight: 'bold',
      justifyContent: 'center',
      _hover: {
        bg: 'gray.850',
      },
      _open: {
        borderBottomLeftRadius: '0',
        borderBottomRightRadius: '0',
      },
    },
    itemContent: {
      borderRadius: 'none',
    },
    itemBody: {
      pt: '4',
      px: '4',
      pb: '0',
      border: '4px solid',
      borderColor: 'gray.900',
      borderTop: 0,
      borderBottomRadius: 'xl',
    },
  },
});
