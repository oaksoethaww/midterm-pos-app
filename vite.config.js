import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative assets make the production app work both on GitHub Pages and
  // when dist/index.html is opened from a local static server.
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: 'vite-entry.html',
      output: {
        entryFileNames: 'assets/app.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
})
