import type { Config } from 'tailwindcss'
import Forms from '@tailwindcss/forms'

export default {
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    screens: {
      sm: '576px',
      md: '768px',
      // lg: '1024px',
      // xl: '1280px',
      // '2xl': '1536px',
    },
  },
  plugins: [
    Forms({ strategy: 'class' }),
  ],
} satisfies Partial<Config>
