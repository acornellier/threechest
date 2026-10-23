import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import compileTime from 'vite-plugin-compile-time'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import tailwindConfig from './tailwind.config.js'

// Builds <RouteMap> as an ES module for embedding in other React apps. React stays external so the
// host's copy is used, which means both sides must be on the same React version.
export default defineConfig({
  plugins: [react(), compileTime()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss({
          ...tailwindConfig,
          important: '.threechest-route-map',
          corePlugins: { preflight: false },
        }),
        autoprefixer(),
      ],
    },
  },
  build: {
    outDir: 'dist-lib',
    copyPublicDir: false,
    lib: {
      entry: 'src/lib/index.ts',
      formats: ['es'],
      fileName: 'route-map',
    },
    rollupOptions: {
      external: [/^react($|\/)/, /^react-dom($|\/)/],
      output: { inlineDynamicImports: true },
    },
  },
})
