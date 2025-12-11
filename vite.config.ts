import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [
    tailwindcss(),
  ],

  base: "/current/",

  server: {
    host: true,
    allowedHosts: true
  },
})