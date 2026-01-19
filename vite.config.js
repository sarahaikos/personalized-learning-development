import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, existsSync, mkdirSync } from 'fs'
import { resolve } from 'path'

// Plugin to sync data folder to public on dev server start and build
const syncDataPlugin = () => {
  return {
    name: 'sync-data',
    configureServer() {
      // Sync notes.json on server start
      const dataPath = resolve(__dirname, 'data/notes.json')
      const publicPath = resolve(__dirname, 'public/data/notes.json')
      
      if (existsSync(dataPath)) {
        try {
          mkdirSync(resolve(__dirname, 'public/data'), { recursive: true })
          copyFileSync(dataPath, publicPath)
          console.log('✅ Synced data/notes.json to public/data/notes.json')
        } catch (e) {
          console.warn('Could not sync notes.json:', e.message)
        }
      }
    },
    buildStart() {
      // Also sync during build (for Vercel deployment)
      const dataPath = resolve(__dirname, 'data/notes.json')
      const publicPath = resolve(__dirname, 'public/data/notes.json')
      
      if (existsSync(dataPath)) {
        try {
          mkdirSync(resolve(__dirname, 'public/data'), { recursive: true })
          copyFileSync(dataPath, publicPath)
        } catch (e) {
          console.warn('Could not sync notes.json during build:', e.message)
        }
      }
    }
  }
}

export default defineConfig({
  plugins: [react(), syncDataPlugin()],
  publicDir: 'public',
  server: {
    fs: {
      allow: ['..']
    }
  },
  build: {
    rollupOptions: {
      input: resolve(__dirname, 'index.html')
    }
  }
})
