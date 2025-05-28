// tailwind.config.cjs
module.exports = {
  content: [
    "./index.html",
    "./src/app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Crimson Pro', 'serif'],
      }
    },
  },
  plugins: [],
}
