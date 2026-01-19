#!/usr/bin/env node

/**
 * Script to generate all days for 12 weeks starting from Monday, January 19, 2026
 * Usage: node scripts/generate-days.js
 */

const fs = require('fs')
const path = require('path')

// Start date: Monday, January 19, 2026
const startDate = new Date('2026-01-19')

// Function to get the date for a specific day in a week
function getDateForDay(weekNumber, dayNumber) {
  // Week 1, Day 1 = Monday Jan 19
  // Each week has 5 days (Mon-Fri)
  const daysFromStart = (weekNumber - 1) * 7 + (dayNumber - 1)
  const date = new Date(startDate)
  date.setDate(startDate.getDate() + daysFromStart)
  return date.toISOString().split('T')[0] // YYYY-MM-DD format
}

// Generate notes structure
const weeks = {}

for (let weekId = 1; weekId <= 12; weekId++) {
  weeks[weekId] = {
    id: weekId,
    days: {}
  }
  
  // Add 5 days per week (Monday to Friday)
  for (let dayNumber = 1; dayNumber <= 5; dayNumber++) {
    const date = getDateForDay(weekId, dayNumber)
    
    weeks[weekId].days[dayNumber] = {
      dayNumber,
      date,
      content: ''
    }
  }
}

// Write to both locations
const dataPath = path.join(__dirname, '../data/notes.json')
const publicDataPath = path.join(__dirname, '../public/data/notes.json')

fs.writeFileSync(dataPath, JSON.stringify(weeks, null, 2), 'utf8')
fs.writeFileSync(publicDataPath, JSON.stringify(weeks, null, 2), 'utf8')

console.log('✅ Successfully generated days for all 12 weeks!')
console.log(`   Start date: ${startDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`)
console.log(`   Total weeks: 12`)
console.log(`   Days per week: 5 (Monday-Friday)`)
console.log(`   Total days: ${12 * 5}`)
console.log('\n📝 Files updated:')
console.log(`   - data/notes.json`)
console.log(`   - public/data/notes.json`)

