import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'noto-sans-jp': ['var(--font-inter)', 'var(--font-noto-sans-jp)'],
        'source-code-pro': ['var(--font-source-code-pro)'],
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
export default config;
