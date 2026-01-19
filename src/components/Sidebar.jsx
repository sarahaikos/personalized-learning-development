import { useState } from 'react'
import './Sidebar.css'

function Sidebar({ weeks, selectedWeek, onSelectWeek }) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
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
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label="Toggle sidebar"
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>
      
      {!isCollapsed && (
        <nav className="sidebar-nav">
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
  )
}

export default Sidebar

