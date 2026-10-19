/** Tailwind v3 config (was inline in index.html for the CDN build). */
module.exports = {
  content: ["./src/**/*.{js,jsx}", "./src/index.html"],

  theme: {
    extend: {
      colors: {
        frozen: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        }
      }
    }
  }
};
