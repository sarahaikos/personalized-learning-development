#!/usr/bin/env node

/**
 * Script to export uploaded files from notes.json to the files/ directory
 * Usage: node scripts/export-files.js
 */

const fs = require('fs')
const path = require('path')

const notesPath = path.join(__dirname, '../data/notes.json')
const filesDir = path.join(__dirname, '../files')

// Ensure files directory exists
if (!fs.existsSync(filesDir)) {
  fs.mkdirSync(filesDir, { recursive: true })
}

try {
  const notes = JSON.parse(fs.readFileSync(notesPath, 'utf8'))
  let exportedCount = 0

  Object.keys(notes).forEach(weekId => {
    const week = notes[weekId]
    const weekDir = path.join(filesDir, `week-${weekId}`)
    
    if (!fs.existsSync(weekDir)) {
      fs.mkdirSync(weekDir, { recursive: true })
    }

    Object.keys(week.days || {}).forEach(dayId => {
      const day = week.days[dayId]
      const dayDir = path.join(weekDir, `day-${dayId}`)
      
      if (!fs.existsSync(dayDir)) {
        fs.mkdirSync(dayDir, { recursive: true })
      }

      if (day.files && day.files.length > 0) {
        day.files.forEach(file => {
          // If file has base64 data, extract and save it
          if (file.data) {
            const base64Data = file.data.split(',')[1] || file.data
            const buffer = Buffer.from(base64Data, 'base64')
            const filePath = path.join(dayDir, file.name)
            
            // Only write if file doesn't exist
            if (!fs.existsSync(filePath)) {
              fs.writeFileSync(filePath, buffer)
              exportedCount++
              console.log(`✅ Exported: files/week-${weekId}/day-${dayId}/${file.name}`)
            }
          } else if (file.path) {
            // File already has a path reference, just verify it exists
            const expectedPath = path.join(__dirname, '..', file.path)
            if (fs.existsSync(expectedPath)) {
              console.log(`✓ File exists at: ${file.path}`)
            } else {
              console.log(`⚠️  File not found at: ${file.path}`)
            }
          }
        })
      }
    })
  })

  if (exportedCount === 0) {
    console.log('ℹ️  No new files to export')
  } else {
    console.log(`\n✅ Exported ${exportedCount} file(s) to files/ directory`)
  }

} catch (error) {
  console.error('❌ Error exporting files:', error.message)
  process.exit(1)
}

