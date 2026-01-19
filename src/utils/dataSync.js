/**
 * Utility functions for syncing notes between localStorage and data/notes.json
 */

export async function loadNotesFromFile() {
  try {
    // Vite serves files from public folder at root
    const response = await fetch('/data/notes.json')
    if (!response.ok) {
      throw new Error('Failed to load notes.json')
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.warn('Could not load notes from file (this is OK if file does not exist yet):', error.message)
    return null
  }
}

export function exportNotesToFile(weeks) {
  // Create a downloadable JSON file
  const dataStr = JSON.stringify(weeks, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'notes.json'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  // Count files
  let totalFiles = 0
  Object.values(weeks).forEach(week => {
    Object.values(week.days || {}).forEach(day => {
      if (day.files) {
        totalFiles += day.files.length
      }
    })
  })
  
  // Also copy to clipboard for easy pasting
  navigator.clipboard.writeText(dataStr).then(() => {
    console.log('✅ Notes exported and copied to clipboard!')
    if (totalFiles > 0) {
      console.log(`📎 ${totalFiles} file(s) included in export`)
      console.log('💡 Run: node scripts/export-files.js to extract files to files/ directory')
    }
    console.log('📝 Next steps:')
    console.log('   1. Save the downloaded notes.json file')
    console.log('   2. Copy it to: data/notes.json')
    console.log('   3. Also copy to: public/data/notes.json (for dev server)')
    if (totalFiles > 0) {
      console.log('   4. Run: node scripts/export-files.js to extract files')
    }
    console.log('   5. Commit and push to git')
  }).catch(err => {
    console.error('Failed to copy to clipboard:', err)
  })
  
  return dataStr
}

export function mergeNotes(localStorageNotes, fileNotes) {
  // Merge strategy: localStorage takes precedence (has latest changes)
  // But if localStorage is empty, use file notes
  if (!localStorageNotes || Object.keys(localStorageNotes).length === 0) {
    return migrateOldFormat(fileNotes || {})
  }
  
  // Deep merge: file notes as base, localStorage as updates
  const merged = { ...fileNotes }
  
  Object.keys(localStorageNotes).forEach(weekId => {
    if (!merged[weekId]) {
      merged[weekId] = migrateOldFormat({ [weekId]: localStorageNotes[weekId] })[weekId] || localStorageNotes[weekId]
    } else {
      // Merge days - ensure each day is properly isolated by week and dayNumber
      const mergedDays = { ...(merged[weekId].days || {}) }
      Object.keys(localStorageNotes[weekId].days || {}).forEach(dayId => {
        const day = localStorageNotes[weekId].days[dayId]
        // Ensure we use the correct dayNumber and preserve week isolation
        const dayKey = String(day.dayNumber || dayId)
        // Only merge if this day belongs to this week
        if (day.dayNumber || dayId) {
          mergedDays[dayKey] = {
            ...migrateDayFormat(day),
            dayNumber: day.dayNumber || parseInt(dayId)
          }
        }
      })
      merged[weekId] = {
        ...merged[weekId],
        days: mergedDays
      }
    }
  })
  
  return migrateOldFormat(merged)
}

// Migrate old format (with multiple fields) to new format (single content field)
function migrateOldFormat(weeks) {
  const migrated = {}
  Object.keys(weeks).forEach(weekId => {
    const week = weeks[weekId]
    migrated[weekId] = {
      ...week,
      days: {}
    }
    Object.keys(week.days || {}).forEach(dayId => {
      migrated[weekId].days[dayId] = migrateDayFormat(week.days[dayId])
    })
  })
  return migrated
}

function migrateDayFormat(day) {
  // If already in new format, return as is (preserve files if they exist)
  if (day.content !== undefined) {
    return {
      ...day,
      dayNumber: day.dayNumber,
      files: day.files || []
    }
  }
  
  // Migrate from old format to new format
  const parts = []
  if (day.objective) parts.push(`<h3>Objective of the Day</h3><p>${day.objective}</p>`)
  if (day.activities) parts.push(`<h3>Activities / Experiments</h3><p>${day.activities}</p>`)
  if (day.findings) parts.push(`<h3>Findings / Insights</h3><p>${day.findings}</p>`)
  if (day.issues) parts.push(`<h3>Issues / Questions</h3><p>${day.issues}</p>`)
  if (day.nextSteps) parts.push(`<h3>Next Steps</h3><p>${day.nextSteps}</p>`)
  
  return {
    dayNumber: day.dayNumber,
    date: day.date,
    content: parts.join(''),
    files: day.files || []
  }
}

