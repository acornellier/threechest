// vite.config.ts
import { defineConfig, splitVendorChunkPlugin } from "file:///Users/alex/git/threechest/node_modules/vite/dist/node/index.js";
import react from "file:///Users/alex/git/threechest/node_modules/@vitejs/plugin-react-swc/index.mjs";
import compileTime from "file:///Users/alex/git/threechest/node_modules/vite-plugin-compile-time/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [react(), splitVendorChunkPlugin(), compileTime()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/leaflet/"))
            return "leaflet";
          if (id.includes("node_modules/yjs/") || id.includes("node_modules/y-protocols/") || id.includes("node_modules/y-webrtc/") || id.includes("node_modules/simple-peer/") || id.includes("node_modules/lib0/"))
            return "collab";
          if (id.includes("/sampleRoutes.ts"))
            return "sampleRoutes";
          const mdtDungeonMatch = id.match(/mdtDungeons\/(.+_mdt).json/);
          if (mdtDungeonMatch)
            return mdtDungeonMatch[1];
        }
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvYWxleC9naXQvdGhyZWVjaGVzdFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2FsZXgvZ2l0L3RocmVlY2hlc3Qvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2FsZXgvZ2l0L3RocmVlY2hlc3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcsIHNwbGl0VmVuZG9yQ2h1bmtQbHVnaW4gfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0LXN3YydcbmltcG9ydCBjb21waWxlVGltZSBmcm9tICd2aXRlLXBsdWdpbi1jb21waWxlLXRpbWUnXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtyZWFjdCgpLCBzcGxpdFZlbmRvckNodW5rUGx1Z2luKCksIGNvbXBpbGVUaW1lKCldLFxuICBidWlsZDoge1xuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBtYW51YWxDaHVua3MoaWQ6IHN0cmluZykge1xuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL2xlYWZsZXQvJykpIHJldHVybiAnbGVhZmxldCdcblxuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIGlkLmluY2x1ZGVzKCdub2RlX21vZHVsZXMveWpzLycpIHx8XG4gICAgICAgICAgICBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL3ktcHJvdG9jb2xzLycpIHx8XG4gICAgICAgICAgICBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL3ktd2VicnRjLycpIHx8XG4gICAgICAgICAgICBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL3NpbXBsZS1wZWVyLycpIHx8XG4gICAgICAgICAgICBpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzL2xpYjAvJylcbiAgICAgICAgICApXG4gICAgICAgICAgICByZXR1cm4gJ2NvbGxhYidcblxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnL3NhbXBsZVJvdXRlcy50cycpKSByZXR1cm4gJ3NhbXBsZVJvdXRlcydcblxuICAgICAgICAgIGNvbnN0IG1kdER1bmdlb25NYXRjaCA9IGlkLm1hdGNoKC9tZHREdW5nZW9uc1xcLyguK19tZHQpLmpzb24vKVxuICAgICAgICAgIGlmIChtZHREdW5nZW9uTWF0Y2gpIHJldHVybiBtZHREdW5nZW9uTWF0Y2hbMV1cbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbn0pXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWdRLFNBQVMsY0FBYyw4QkFBOEI7QUFDclQsT0FBTyxXQUFXO0FBQ2xCLE9BQU8saUJBQWlCO0FBRXhCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxNQUFNLEdBQUcsdUJBQXVCLEdBQUcsWUFBWSxDQUFDO0FBQUEsRUFDMUQsT0FBTztBQUFBLElBQ0wsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ04sYUFBYSxJQUFZO0FBQ3ZCLGNBQUksR0FBRyxTQUFTLHVCQUF1QjtBQUFHLG1CQUFPO0FBRWpELGNBQ0UsR0FBRyxTQUFTLG1CQUFtQixLQUMvQixHQUFHLFNBQVMsMkJBQTJCLEtBQ3ZDLEdBQUcsU0FBUyx3QkFBd0IsS0FDcEMsR0FBRyxTQUFTLDJCQUEyQixLQUN2QyxHQUFHLFNBQVMsb0JBQW9CO0FBRWhDLG1CQUFPO0FBRVQsY0FBSSxHQUFHLFNBQVMsa0JBQWtCO0FBQUcsbUJBQU87QUFFNUMsZ0JBQU0sa0JBQWtCLEdBQUcsTUFBTSw0QkFBNEI7QUFDN0QsY0FBSTtBQUFpQixtQkFBTyxnQkFBZ0IsQ0FBQztBQUFBLFFBQy9DO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
