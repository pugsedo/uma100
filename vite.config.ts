import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repoName = '/uma100/';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: repoName,
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  }
})
