import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Week from './components/Week'
import { loadNotesFromFile, mergeNotes } from './utils/dataSync'
import { isViewerMode as checkViewerMode } from './utils/viewerMode'
import './App.css'

const TOTAL_WEEKS = 12 // 3 months = 12 weeks

function App() {
  const [weeks, setWeeks] = useState(() => {
    // Initialize with empty structure
    const initialWeeks = {}
    for (let i = 1; i <= TOTAL_WEEKS; i++) {
      initialWeeks[i] = {
        id: i,
        days: {}
      }
    }
    return initialWeeks
  })

  const [selectedWeek, setSelectedWeek] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [manualViewerMode, setManualViewerMode] = useState(() => {
    // Check if viewer mode was manually set
    const saved = localStorage.getItem('rd-viewer-mode')
    return saved === 'true'
  })
  
  // Check if we're in viewer mode (auto or manual)
  const viewerMode = checkViewerMode(manualViewerMode)

  // Load data from both file and localStorage on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      
      // Load from file first
      const fileNotes = await loadNotesFromFile()
      
      // Load from localStorage
      const savedData = localStorage.getItem('rd-notes')
      let localStorageNotes = null
      if (savedData) {
        try {
          localStorageNotes = JSON.parse(savedData)
        } catch (e) {
          console.error('Error parsing localStorage data:', e)
        }
      }
      
      // Merge: file as base, localStorage as updates
      const merged = mergeNotes(localStorageNotes, fileNotes || weeks)
      
      // Ensure all weeks exist
      for (let i = 1; i <= TOTAL_WEEKS; i++) {
        if (!merged[i]) {
          merged[i] = { id: i, days: {} }
        }
      }
      
      setWeeks(merged)
      setIsLoading(false)
    }
    
    loadData()
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('rd-notes', JSON.stringify(weeks))
    }
  }, [weeks, isLoading])

  const updateDayNote = (weekId, dayId, field, value) => {
    setWeeks(prev => {
      // Ensure weekId and dayId are strings to match JSON structure
      const weekKey = String(weekId)
      const dayKey = String(dayId)
      
      // Ensure the week exists
      if (!prev[weekKey]) {
        prev[weekKey] = { id: parseInt(weekKey), days: {} }
      }
      
      // Ensure the days object exists
      if (!prev[weekKey].days) {
        prev[weekKey].days = {}
      }
      
      const existingDay = prev[weekKey].days[dayKey] || {}
      
      return {
        ...prev,
        [weekKey]: {
          ...prev[weekKey],
          days: {
            ...prev[weekKey].days,
            [dayKey]: {
              ...existingDay,
              dayNumber: existingDay.dayNumber || parseInt(dayKey),
              date: existingDay.date || new Date().toISOString().split('T')[0],
              [field]: value,
              // Preserve files if not updating files field
              files: field === 'files' ? value : (existingDay.files || [])
            }
          }
        }
      }
    })
  }

  const selectedWeekData = weeks[selectedWeek]

  if (isLoading) {
    return (
      <div className="app">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '1rem',
          color: '#666'
        }}>
          Loading notes...
        </div>
      </div>
    )
  }

  const handleToggleViewerMode = () => {
    const newMode = !manualViewerMode
    setManualViewerMode(newMode)
    localStorage.setItem('rd-viewer-mode', newMode ? 'true' : 'false')
  }

  // Check if viewer mode is auto-enabled (Vercel or env var)
  // If so, don't allow manual toggle
  const isAutoViewerMode = () => {
    if (import.meta.env.VITE_VIEWER_MODE === 'true') {
      return true
    }
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      if (hostname.includes('vercel.app') || hostname.includes('vercel.com')) {
        return true
      }
    }
    return false
  }

  return (
    <div className="app">
      <Sidebar 
        weeks={weeks} 
        selectedWeek={selectedWeek}
        onSelectWeek={setSelectedWeek}
        viewerMode={viewerMode}
        onToggleViewerMode={handleToggleViewerMode}
        canToggleViewerMode={!isAutoViewerMode()} // Only allow toggle if not auto-enabled
      />
      <main className="app-main">
        <div className="main-content">
          {selectedWeekData && (
            <Week
              week={selectedWeekData}
              onUpdateDayNote={updateDayNote}
              allWeeks={weeks}
              viewerMode={viewerMode}
            />
          )}
        </div>
      </main>
    </div>
  )
}

export default App

