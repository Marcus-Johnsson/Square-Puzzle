import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  base: '/Square-Puzzle/', // This should match your GitHub repo name
  build: {
    outDir: 'dist'
  }
})
