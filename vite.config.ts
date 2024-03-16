import { defineConfig, splitVendorChunkPlugin } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
// noinspection JSUnusedGlobalSymbols
export default defineConfig({
  plugins: [react(), splitVendorChunkPlugin()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/leaflet/')) return 'leaflet'

          const mdtDungeonMatch = id.match(/mdtDungeons\/(.+_mdt).json/)
          if (mdtDungeonMatch) return mdtDungeonMatch[1]
        },
      },
    },
  },
})
