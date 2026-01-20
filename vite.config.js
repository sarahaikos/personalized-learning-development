import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs'
import { resolve, join } from 'path'

// Helper to recursively copy a directory
const copyDirSync = (srcDir, destDir) => {
  if (!existsSync(srcDir)) return
  mkdirSync(destDir, { recursive: true })
  const entries = readdirSync(srcDir)
  for (const entry of entries) {
    const srcPath = join(srcDir, entry)
    const destPath = join(destDir, entry)
    const stats = statSync(srcPath)
    if (stats.isDirectory()) {
      copyDirSync(srcPath, destPath)
    } else {
      copyFileSync(srcPath, destPath)
    }
  }
}

// Plugin to sync data folder (notes + files) to public on dev server start and build
const syncDataPlugin = () => {
  const syncAll = () => {
    // Sync notes.json
    const dataNotesPath = resolve(__dirname, 'data/notes.json')
    const publicNotesPath = resolve(__dirname, 'public/data/notes.json')
    
    if (existsSync(dataNotesPath)) {
      try {
        mkdirSync(resolve(__dirname, 'public/data'), { recursive: true })
        copyFileSync(dataNotesPath, publicNotesPath)
        console.log('✅ Synced data/notes.json to public/data/notes.json')
      } catch (e) {
        console.warn('Could not sync notes.json:', e.message)
      }
    }

    // Sync files directory so Vercel can serve them from /data/files/...
    const dataFilesDir = resolve(__dirname, 'data/files')
    const publicFilesDir = resolve(__dirname, 'public/data/files')
    if (existsSync(dataFilesDir)) {
      try {
        copyDirSync(dataFilesDir, publicFilesDir)
        console.log('✅ Synced data/files to public/data/files')
      } catch (e) {
        console.warn('Could not sync data/files:', e.message)
      }
    }
  }

  return {
    name: 'sync-data',
    configureServer() {
      // Sync on dev server start
      syncAll()
    },
    buildStart() {
      // Also sync during build (for Vercel deployment)
      syncAll()
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
