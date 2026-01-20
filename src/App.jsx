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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [manualViewerMode, setManualViewerMode] = useState(() => {
    // Only check localStorage if not on Vercel (auto-detection takes precedence)
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      // If on Vercel, ignore localStorage
      if (
        hostname.includes('vercel.app') || 
        hostname.includes('vercel.com') ||
        hostname.endsWith('.vercel.app') ||
        hostname.endsWith('.vercel.com')
      ) {
        return null // Let auto-detection handle it
      }
      // Check if viewer mode was manually set (only locally)
      const saved = localStorage.getItem('rd-viewer-mode')
      return saved === 'true' ? true : (saved === 'false' ? false : null)
    }
    return null
  })
  
  // Check if we're in viewer mode (auto or manual)
  // Pass null to let auto-detection work, or the manual value if set locally
  const viewerMode = checkViewerMode(manualViewerMode)

  // Load data from both file and localStorage on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      
      // Load from file first
      const fileNotes = await loadNotesFromFile()
      
      // Check if we're on Vercel/production
      const isProduction = typeof window !== 'undefined' && (
        window.location.hostname.includes('vercel.app') ||
        window.location.hostname.includes('vercel.com') ||
        window.location.hostname.endsWith('.vercel.app') ||
        window.location.hostname.endsWith('.vercel.com')
      )
      
      // On production, prioritize file notes and ignore localStorage
      // On local dev, merge localStorage with file notes
      let localStorageNotes = null
      if (!isProduction) {
        const savedData = localStorage.getItem('rd-notes')
        if (savedData) {
          try {
            localStorageNotes = JSON.parse(savedData)
          } catch (e) {
            console.error('Error parsing localStorage data:', e)
          }
        }
      } else {
        // On production, clear old localStorage to ensure file notes are used
        console.log('Production mode: Using file notes only')
      }
      
      // Merge: file as base, localStorage as updates (only on local dev)
      const merged = mergeNotes(isProduction ? null : localStorageNotes, fileNotes || weeks)
      
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
      if (
        hostname.includes('vercel.app') || 
        hostname.includes('vercel.com') ||
        hostname.endsWith('.vercel.app') ||
        hostname.endsWith('.vercel.com')
      ) {
        return true
      }
    }
    return false
  }

  return (
    <div className="app">
      <button
        className="mobile-menu-button"
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        aria-label="Toggle menu"
      >
        ☰
      </button>
      <Sidebar 
        weeks={weeks} 
        selectedWeek={selectedWeek}
        onSelectWeek={setSelectedWeek}
        viewerMode={viewerMode}
        onToggleViewerMode={handleToggleViewerMode}
        canToggleViewerMode={!isAutoViewerMode()} // Only allow toggle if not auto-enabled
        isMobileOpen={isMobileSidebarOpen}
        onMobileToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
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

