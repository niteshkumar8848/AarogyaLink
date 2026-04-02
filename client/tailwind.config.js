/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0f766e',
        accent: '#14b8a6',
        surface: '#f0fdfa',
        ink: '#083344'
      },
      boxShadow: {
        card: '0 8px 24px rgba(15, 118, 110, 0.12)'
      }
    }
  },
  plugins: []
};
