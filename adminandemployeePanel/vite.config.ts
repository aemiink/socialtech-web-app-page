import { defineConfig } from 'vitest/config'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id: string) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined
          }

          if (id.includes('recharts')) {
            return 'vendor-recharts'
          }

          if (id.includes('@radix-ui')) {
            return 'vendor-radix'
          }

          if (id.includes('@reduxjs/toolkit') || id.includes('react-redux')) {
            return 'vendor-redux'
          }

          if (id.includes('react-router')) {
            return 'vendor-router'
          }

          if (id.includes('lucide-react')) {
            return 'vendor-icons'
          }

          return 'vendor-core'
        },
      },
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setupTests.ts'],
  },
})
