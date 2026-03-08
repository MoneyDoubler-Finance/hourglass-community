import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// Treat .js files containing JSX as JSX — needed for CRA-heritage files
// that were never renamed to .jsx (e.g. the locked WarpBox component).
function jsxInJs() {
  return {
    name: 'treat-js-as-jsx',
    async transform(code, id) {
      if (!id.endsWith('.js')) return null
      // Only transform files under src/
      if (!id.includes('/src/')) return null
      // Use esbuild to transform JSX
      const { transformWithEsbuild } = await import('vite')
      return transformWithEsbuild(code, id + '?jsx', {
        loader: 'jsx',
        jsx: 'automatic',
      })
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    jsxInJs(),
    nodePolyfills({
      include: ['buffer', 'process', 'stream', 'crypto', 'http', 'https', 'os', 'url', 'assert'],
      globals: {
        Buffer: true,
        process: true,
      },
    }),
  ],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
  },
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
      },
    },
  },
  define: {
    global: 'globalThis',
  },
})
