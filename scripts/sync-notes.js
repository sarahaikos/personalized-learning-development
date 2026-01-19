#!/usr/bin/env node

/**
 * Script to sync notes from localStorage export to data/notes.json
 * 
 * Usage:
 * 1. Export notes from the app (click "Save to Code" button)
 * 2. Save the downloaded notes.json to data/notes.json
 * 3. Or run this script: node scripts/sync-notes.js <path-to-exported-notes.json>
 */

const fs = require('fs')
const path = require('path')

const notesFilePath = path.join(__dirname, '../data/notes.json')
const exportedNotesPath = process.argv[2]

if (!exportedNotesPath) {
  console.log('Usage: node scripts/sync-notes.js <path-to-exported-notes.json>')
  console.log('Example: node scripts/sync-notes.js ~/Downloads/notes.json')
  process.exit(1)
}

try {
  // Read exported notes
  const exportedNotes = JSON.parse(fs.readFileSync(exportedNotesPath, 'utf8'))
  
  // Write to data/notes.json
  fs.writeFileSync(
    notesFilePath,
    JSON.stringify(exportedNotes, null, 2),
    'utf8'
  )
  
  console.log('✅ Successfully synced notes to data/notes.json')
  console.log(`   Updated ${Object.keys(exportedNotes).length} weeks`)
  
  // Count total days
  let totalDays = 0
  Object.values(exportedNotes).forEach(week => {
    totalDays += Object.keys(week.days || {}).length
  })
  console.log(`   Total days: ${totalDays}`)
  
} catch (error) {
  console.error('❌ Error syncing notes:', error.message)
  process.exit(1)
}

