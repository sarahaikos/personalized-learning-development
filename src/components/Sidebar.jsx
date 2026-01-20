import { useState, useEffect } from 'react'
import './Sidebar.css'

function Sidebar({ weeks, selectedWeek, onSelectWeek, viewerMode, onToggleViewerMode, canToggleViewerMode, isMobileOpen, onMobileToggle }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [prevSelectedWeek, setPrevSelectedWeek] = useState(selectedWeek)
  
  // Close mobile sidebar when a week is selected (only if it actually changed)
  useEffect(() => {
    if (isMobileOpen && onMobileToggle && selectedWeek !== prevSelectedWeek) {
      // Small delay to allow navigation to complete
      const timer = setTimeout(() => {
        onMobileToggle()
      }, 300)
      setPrevSelectedWeek(selectedWeek)
      return () => clearTimeout(timer)
    }
    setPrevSelectedWeek(selectedWeek)
  }, [selectedWeek, isMobileOpen, onMobileToggle, prevSelectedWeek])

  return (
    <>
      <div className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-header-content">
            <img 
              src="/logo_radylabs.png" 
              alt="Radyalabs" 
              className="sidebar-logo"
            />
            <h2>R&D Notes</h2>
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => {
              if (window.innerWidth <= 1024 && onMobileToggle) {
                onMobileToggle()
              } else {
                setIsCollapsed(!isCollapsed)
              }
            }}
            aria-label="Toggle sidebar"
          >
            {isCollapsed ? '→' : '←'}
          </button>
        </div>
        
        {!isCollapsed && (
          <nav className="sidebar-nav">
          {canToggleViewerMode && (
            <div className="viewer-mode-toggle-section">
              <button
                className={`viewer-mode-toggle ${viewerMode ? 'active' : ''}`}
                onClick={onToggleViewerMode}
                title={viewerMode ? 'Switch to Edit Mode' : 'Preview Viewer Mode'}
              >
                <span className="viewer-mode-text">
                  {viewerMode ? 'Viewer Mode' : 'Edit Mode'}
                </span>
              </button>
            </div>
          )}
          {viewerMode && canToggleViewerMode && (
            <div className="viewer-mode-indicator">
              <span className="viewer-mode-badge">Read-Only</span>
            </div>
          )}
          <div className="nav-section">
            <div className="nav-section-title">Weeks</div>
            {Object.values(weeks).map(week => {
              const days = Object.values(week.days || {}).length
              return (
                <button
                  key={week.id}
                  className={`nav-item ${selectedWeek === week.id ? 'active' : ''}`}
                  onClick={() => onSelectWeek(week.id)}
                >
                  <span className="nav-item-text">Week {week.id}</span>
                  {days > 0 && (
                    <span className="nav-item-badge">{days}</span>
                  )}
                </button>
              )
            })}
          </div>
        </nav>
      )}
    </div>
    {isMobileOpen && (
      <div 
        className="sidebar-overlay"
        onClick={onMobileToggle}
        aria-label="Close sidebar"
      />
    )}
    </>
  )
}

export default Sidebar

