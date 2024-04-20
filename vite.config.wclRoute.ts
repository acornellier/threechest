import { defineConfig } from 'vite'
import compileTime from 'vite-plugin-compile-time'

export default defineConfig({
  plugins: [compileTime()],
  publicDir: false,
  build: {
    emptyOutDir: false,
    lib: {
      name: 'wclRoute',
      entry: 'server/wclRoute.ts',
      fileName: 'wclRoute',
    },
    rollupOptions: {
      external: ['fs', 'path', 'dotenv-flow'],
    },
  },
})
