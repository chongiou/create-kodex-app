import { defineConfig, type AliasOptions } from 'vite'
import zdjl from 'vite-mjs-to-zjs'
import path from 'path'
import pkg from './package.json'
import singleLinePlugin from './plugins/vite-plugin-singleline'
import react from '@vitejs/plugin-react'

// 模块别名, 不要轻易移动列表项的顺序
const alias: AliasOptions = [
  {
    find: '@',
    replacement: path.resolve('./src')
  },
  {
    find: '#',
    replacement: path.resolve('.')
  },
  {
    find: '@zdjl/kodex/jsx-runtime',
    replacement: '@zdjl/kodex/jsx-runtime'
  },
  // 如果你希望从网络导入 kodex 就打开这个注释和 external 的注释
  // {
  //   find: '@zdjl/kodex',
  //   replacement: '@zdjl/kodex/dist/zdjl/index.min.cjs'
  // }
]

// 不打包这些模块
const external = [
  /^node:/,
  'fs'
  // '@zdjl/kodex/dist/zdjl/index.min.cjs',
]

const zdjlPlugin = (isTestVersion: boolean) =>
  zdjl({
    output: {
      filename: pkg.name,
      formats: ['zjs']
    },
    manifest: {
      description: `\
        构建日期: ${new Date().toLocaleString()}
        版本: ${pkg.version}
        作者: ${pkg.author}
        许可证: ${pkg.license}
        测试版: ${isTestVersion ? '是' : '否'}`.replace(/[^\S\n]{2,}/g, ''),
      count: 1,
    }
  })

const productionConfig = () =>
  defineConfig({
    plugins: [
      react({ jsxRuntime: 'automatic', jsxImportSource: '@zdjl/kodex' }),
      singleLinePlugin(),
      zdjlPlugin(false),
    ],
    resolve: {
      alias,
    },
    build: {
      minify: true,
      target: 'es2022',
      outDir: 'dist',
      lib: {
        entry: {
          'index': 'src/index.jsx',
        },
        formats: ['es'],
      },
      rollupOptions: {
        external,
      }
    }
  })

const testConfig = () =>
  defineConfig({
    plugins: [
      react({ jsxRuntime: 'automatic', jsxImportSource: '@zdjl/kodex' }),
      zdjlPlugin(true),
    ],
    resolve: {
      alias,
    },
    build: {
      minify: false,
      target: 'es2022',
      outDir: 'test',
      lib: {
        entry: {
          'index': 'src/index.jsx'
        },
        formats: ['es'],
      },
      rollupOptions: {
        external,
      }
    },
  })

export default defineConfig(({ mode }) => {
  if (mode === 'test') {
    return testConfig()
  }
  return productionConfig()
})
