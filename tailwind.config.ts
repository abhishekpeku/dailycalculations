import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      boxShadow: {
        panel: '0 10px 40px rgba(15, 23, 42, 0.08)'
      },
      colors: {
        brand: {
          50: '#eef7ff',
          100: '#d9ecff',
          500: '#2563eb',
          700: '#1d4ed8'
        }
      }
    }
  },
  plugins: []
};

export default config;
