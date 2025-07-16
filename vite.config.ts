import { defineConfig } from 'vite'
import { dependencies } from './package.json'
import fs from 'fs-extra'

function copyTemplates() {
  return {
    name: 'copy-templates',
    closeBundle() {
      fs.copySync('templates', 'dist/templates')
      console.log('✅ Templates copied!')
    }
  }
}

export default defineConfig({
  plugins: [
    copyTemplates()
  ],
  build: {
    target: 'node20',
    minify: false,
    outDir: 'dist',
    lib: {
      entry: {
        'bin/index': 'bin/index.ts'
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [/^node:/, ...Object.keys(dependencies)],
    }
  },
})

