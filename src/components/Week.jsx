import { useState } from 'react'
import Day from './Day'
import './Week.css'

function Week({ week, onUpdateDayNote, allWeeks }) {
  const days = Object.values(week.days || {}).sort((a, b) => a.dayNumber - b.dayNumber)

  return (
    <div className="week-container">
      <div className="week-header">
        <h1 className="week-title">Week {week.id}</h1>
        {days.length > 0 && (
          <div className="week-day-count">
            {days.length} {days.length === 1 ? 'day' : 'days'}
          </div>
        )}
      </div>
      
      <div className="week-content">
        {days.length > 0 ? (
          days.map(day => (
            <Day
              key={`week-${week.id}-day-${day.dayNumber}`}
              day={day}
              weekId={week.id}
              onUpdate={onUpdateDayNote}
              allWeeks={allWeeks}
            />
          ))
        ) : (
          <div className="empty-week">
            <p>No days added yet. Add days through code.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Week

