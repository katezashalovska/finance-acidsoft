import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4D7CFE',
          foreground: '#FFFFFF',
        },
        success: {
          DEFAULT: '#27AE60',
          foreground: '#FFFFFF',
        },
        danger: {
          DEFAULT: '#EB5757',
          foreground: '#FFFFFF',
        },
        background: '#F8F9FB',
        foreground: '#1A1D1F',
        muted: {
          DEFAULT: '#6F767E',
          foreground: '#9A9FA5',
        },
        border: '#EFEFEF',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
export default config
