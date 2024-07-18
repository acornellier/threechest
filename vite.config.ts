import { defineConfig, splitVendorChunkPlugin } from 'vite'
import react from '@vitejs/plugin-react-swc'
import compileTime from 'vite-plugin-compile-time'

export default defineConfig({
  plugins: [react(), splitVendorChunkPlugin(), compileTime()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/leaflet/')) return 'leaflet'

          if (
            id.includes('node_modules/yjs/') ||
            id.includes('node_modules/y-protocols/') ||
            id.includes('node_modules/y-webrtc/') ||
            id.includes('node_modules/simple-peer/') ||
            id.includes('node_modules/lib0/')
          )
            return 'collab'

          if (id.includes('/sampleRoutes.ts')) return 'sampleRoutes'

          const mdtDungeonMatch = id.match(/mdtDungeons\/(.+_mdt).json/)
          if (mdtDungeonMatch) return mdtDungeonMatch[1]
        },
      },
    },
  },
})
