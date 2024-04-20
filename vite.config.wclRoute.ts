import { defineConfig } from 'vite'
import compileTime from 'vite-plugin-compile-time'

export default defineConfig({
  plugins: [compileTime()],
  publicDir: false,
  resolve: {
    alias: {
      url: 'rollup-plugin-node-polyfills/polyfills/url',
    },
  },
  build: {
    emptyOutDir: false,
    lib: {
      name: 'wclRoute',
      entry: 'server/wclRoute.ts',
      fileName: 'wclRoute',
    },
  },
})
