#!/usr/bin/env node

/**
 * Script to update notes.json to use file paths instead of base64 data
 * This converts existing base64 file data to path references
 * Usage: node scripts/save-file-reference.js
 */

const fs = require('fs')
const path = require('path')

const notesPath = path.join(__dirname, '../data/notes.json')
const filesBaseDir = path.join(__dirname, '../data/files')

// Ensure files directory exists
if (!fs.existsSync(filesBaseDir)) {
  fs.mkdirSync(filesBaseDir, { recursive: true })
}

try {
  const notes = JSON.parse(fs.readFileSync(notesPath, 'utf8'))
  let convertedCount = 0

  Object.keys(notes).forEach(weekId => {
    const week = notes[weekId]
    const weekDir = path.join(filesBaseDir, `week-${weekId}`)
    
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
        day.files = day.files.map(file => {
          // If file has base64 data, extract and save it, then replace with path
          if (file.data && !file.path) {
            try {
              const base64Data = file.data.split(',')[1] || file.data
              const buffer = Buffer.from(base64Data, 'base64')
              const filePath = path.join(dayDir, file.name)
              
              // Save file to disk
              fs.writeFileSync(filePath, buffer)
              convertedCount++
              
              // Return file with path instead of data
              const { data, ...fileWithoutData } = file
              return {
                ...fileWithoutData,
                path: `data/files/week-${weekId}/day-${dayId}/${file.name}`
              }
            } catch (error) {
              console.error(`Error converting file ${file.name}:`, error.message)
              return file
            }
          }
          // If already has path, keep it
          return file
        })
      }
    })
  })

  // Save updated notes
  fs.writeFileSync(notesPath, JSON.stringify(notes, null, 2), 'utf8')
  
  if (convertedCount > 0) {
    console.log(`✅ Converted ${convertedCount} file(s) from base64 to path references`)
    console.log(`📁 Files saved to data/files/ directory`)
  } else {
    console.log('ℹ️  No files to convert (all files already use path references)')
  }

} catch (error) {
  console.error('❌ Error converting files:', error.message)
  process.exit(1)
}

