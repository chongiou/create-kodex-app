import { defineConfig } from 'vite'
import { dependencies } from './package.json'

export default defineConfig({
  build: {
    target: 'esnext',
    minify: false,
    outDir: 'dist',
    lib: {
      entry: 'bin/index.ts',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: [/^node:/, ...Object.keys(dependencies)],
    }
  },
})

