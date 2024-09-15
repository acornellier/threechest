import { defineConfig } from 'vite'
import compileTime from 'vite-plugin-compile-time'

export default defineConfig({
  plugins: [compileTime()],
  publicDir: false,
  build: {
    emptyOutDir: false,
    lib: {
      name: 'vercelServer',
      entry: 'server/vercelServer.ts',
      fileName: 'vercelServer',
    },
    rollupOptions: {
      external: ['fs', 'path', 'dotenv-flow'],
    },
  },
})
