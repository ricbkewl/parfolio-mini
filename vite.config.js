import { defineConfig } from 'vite'

export default defineConfig(({ command }) => ({
  // Vercel serves ParFolio Mini from the domain root. Keep relative asset URLs
  // so the same build also remains portable to sub-path/static hosting.
  base: './',
  server: {
    host: true,
    port: 5173,
  },
}))
