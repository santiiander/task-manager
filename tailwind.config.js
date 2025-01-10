module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        customBg: '#D3BCF6',
        customCard: '#a086cc',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}