// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  base: '',
  build: {
    rollupOptions: {
      input: {
        main:    'index.html',
        about:   'aboutme.html',
        contact: 'contactme.html',
        upocket: 'upocket.html',
      },
    },
  },
});