import { chakra, defineRecipe } from '@chakra-ui/react';

export const inputRecipe = defineRecipe({
  base: {
    width: '100%',
    outline: 'none',
    position: 'relative',
    appearance: 'none',
    transition: 'all 0.2s',
    borderRadius: 'md',
    _disabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    _focusVisible: {
      borderColor: 'primary.400',
      boxShadow: '0 0 0 1px {colors.primary.400}',
    },
  },
  variants: {
    variant: {
      outline: {
        bg: 'gray.900',
        borderWidth: '1px',
        borderColor: 'gray.700',
        color: 'white',
        _hover: {
          borderColor: 'gray.600',
          _disabled: {
            borderColor: 'gray.700',
          },
        },
        _placeholder: {
          color: 'gray.500',
        },
      },
      filled: {
        bg: 'gray.850',
        borderWidth: '2px',
        borderColor: 'transparent',
        color: 'white',
        _hover: {
          bg: 'gray.800',
          _disabled: {
            bg: 'gray.850',
          },
        },
        _focusVisible: {
          bg: 'gray.900',
          borderColor: 'primary.400',
          boxShadow: 'none',
        },
        _placeholder: {
          color: 'gray.500',
        },
      },
    },
    size: {
      sm: {
        h: '8',
        px: '3',
        fontSize: 'sm',
      },
      md: {
        h: '10',
        px: '4',
        fontSize: 'md',
      },
      lg: {
        h: '12',
        px: '6',
        fontSize: 'lg',
      },
    },
  },
  defaultVariants: {
    variant: 'outline',
    size: 'md',
  },
});

export const Input = chakra('input', inputRecipe);
