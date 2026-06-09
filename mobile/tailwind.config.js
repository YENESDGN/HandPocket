/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        'primary-blue': '#08b4fb',
        'secondary-blue': '#1ea4dc',
        'tertiary-blue': '#1e91c1',
        'dark-blue': '#206988',
        'darker-blue': '#004561',
      },
    },
  },
  plugins: [],
};
