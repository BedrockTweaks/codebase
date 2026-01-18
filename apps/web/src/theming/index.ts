import {
  createSystem,
  defaultConfig,
  defineConfig,
} from '@chakra-ui/react';
import { accordionSlotRecipe } from './components';

const config = defineConfig({
  theme: {
    breakpoints: {
      'sm': '320px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1200px',
      '2xl': '1400px',
    },
    tokens: {
      colors: {
        // Primary Brand Palette - Deep Red
        primary: {
          DEFAULT: { value: '#630000' },
          50: { value: '#ffe5e5' },
          100: { value: '#ffcccc' },
          200: { value: '#ff9999' },
          300: { value: '#ff6666' },
          400: { value: '#cc3333' },
          500: { value: '#630000' },
          600: { value: '#520000' },
          700: { value: '#420000' },
          800: { value: '#310000' },
          900: { value: '#210000' },
        },

        // Neutral Gray Scale - Backgrounds, Borders, Surfaces
        gray: {
          DEFAULT: { value: '#5c5c5c' },
          50: { value: '#fcfbfb' },
          100: { value: '#f2eded' },
          200: { value: '#808080' },
          300: { value: '#737373' },
          400: { value: '#696969' },
          500: { value: '#5c5c5c' },
          600: { value: '#525252' },
          700: { value: '#454545' },
          800: { value: '#3b3b3b' },
          850: { value: '#2e2e2e' },
          900: { value: '#242424' },
          950: { value: '#171717' },
        },
      },

      fonts: {
        body: { value: 'Urbanist, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"' },
        heading: { value: 'Urbanist, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"' },
        mono: { value: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace' },
      },
    },
    slotRecipes: {
      accordion: accordionSlotRecipe,
    },
  },
  globalCss: {
    html: {
      fontSize: '14px',
    },
  },
});

export const system = createSystem(defaultConfig, config);
