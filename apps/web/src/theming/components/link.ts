import { chakra, defineRecipe } from '@chakra-ui/react';
import { Link as RouterLink } from '@tanstack/react-router';

export const linkRecipe = defineRecipe({
  base: {
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  variants: {
    variant: {
      nav: {
        color: 'white',
        _hover: {
          textDecoration: 'underline',
        },
      },
      link: {
        color: 'primary.300',
        _hover: {
          textDecoration: 'underline',
        },
      },
      underline: {
        color: 'white',
        textDecoration: 'underline',
      },
    },
  },
  defaultVariants: {
    variant: 'link',
  },
});

export const Link = chakra(RouterLink, linkRecipe);
