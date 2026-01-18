import { chakra, defineRecipe } from '@chakra-ui/react';

export const buttonRecipe = defineRecipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'medium',
    borderRadius: 'md',
    cursor: 'pointer',
    transition: 'all 0.2s',
    outline: 'none',
    _disabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    _focusVisible: {
      boxShadow: '0 0 0 3px {colors.primary.400}',
    },
  },
  variants: {
    variant: {
      solid: {
        bg: 'primary.500',
        color: 'white',
        _hover: {
          bg: 'primary.600',
          _disabled: {
            bg: 'primary.500',
          },
        },
        _active: {
          bg: 'primary.700',
        },
      },
      outline: {
        bg: 'transparent',
        borderWidth: '1px',
        borderColor: 'primary.400',
        color: 'primary.400',
        _hover: {
          bg: 'primary.500',
          color: 'white',
          borderColor: 'primary.500',
          _disabled: {
            bg: 'transparent',
            color: 'primary.400',
            borderColor: 'primary.400',
          },
        },
        _active: {
          bg: 'primary.600',
          borderColor: 'primary.600',
        },
      },
      ghost: {
        bg: 'transparent',
        color: 'white',
        _hover: {
          bg: 'gray.800',
          _disabled: {
            bg: 'transparent',
          },
        },
        _active: {
          bg: 'gray.850',
        },
      },
    },
    size: {
      sm: {
        h: '8',
        minW: '8',
        fontSize: 'sm',
        px: '3',
      },
      md: {
        h: '10',
        minW: '10',
        fontSize: 'md',
        px: '4',
      },
      lg: {
        h: '12',
        minW: '12',
        fontSize: 'lg',
        px: '6',
      },
    },
  },
  defaultVariants: {
    variant: 'solid',
    size: 'md',
  },
});

export const Button = chakra('button', buttonRecipe);
