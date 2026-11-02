import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // relative paths: the build works at username.github.io/ and at username.github.io/<repo>/ alike
  base: './',
})
