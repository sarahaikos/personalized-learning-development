/**
 * Utility function to add a day to a specific week
 * 
 * IMPORTANT: After adding days, click "Save to Code" button in the app
 * to export to data/notes.json, then commit to git.
 * 
 * Usage example (in browser console or as a script):
 * 
 * // Add Day 1 to Week 1
 * addDayToWeek(1, 1)
 * 
 * // Add Day 2 to Week 1 with initial content
 * addDayToWeek(1, 2, {
 *   content: '<p>My notes for today. Experimented with <strong>neural networks</strong></p>'
 * })
 */

export function addDayToWeek(weekId, dayNumber, initialContent = {}) {
  // Get existing data from localStorage
  const savedData = localStorage.getItem('rd-notes')
  let weeks = {}
  
  if (savedData) {
    try {
      weeks = JSON.parse(savedData)
    } catch (e) {
      console.error('Error parsing saved data:', e)
      return
    }
  }

  // Initialize week if it doesn't exist
  if (!weeks[weekId]) {
    weeks[weekId] = {
      id: weekId,
      days: {}
    }
  }

  // Add the day
  weeks[weekId].days[dayNumber] = {
    dayNumber,
    date: new Date().toISOString().split('T')[0],
    content: initialContent.content || ''
  }

  // Save back to localStorage
  localStorage.setItem('rd-notes', JSON.stringify(weeks))
  
  console.log(`✅ Added Day ${dayNumber} to Week ${weekId}`)
  console.log('💡 Remember to click "Save to Code" button to export to notes.json')
  
  // Reload the page to see the changes
  window.location.reload()
  
  return weeks[weekId].days[dayNumber]
}

// Example: Add multiple days at once
export function addDaysToWeek(weekId, days) {
  days.forEach(({ dayNumber, ...content }) => {
    addDayToWeek(weekId, dayNumber, content)
  })
}

