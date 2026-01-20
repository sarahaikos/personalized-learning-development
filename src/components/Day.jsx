import { useState, useRef } from 'react'
import RichTextEditor from './RichTextEditor'
import FileUpload from './FileUpload'
import { exportNotesToFile } from '../utils/dataSync'
import './Day.css'

function Day({ day, weekId, onUpdate, allWeeks, viewerMode = false }) {
  const dayNumber = day.dayNumber || 1
  const [saveStatus, setSaveStatus] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const handleChange = (value) => {
    onUpdate(weekId, dayNumber, 'content', value)
  }

  const handleFileSelect = (selectedFiles) => {
    Array.from(selectedFiles).forEach(file => {
      // Store file reference instead of base64 data
      // Files should be placed in data/files/week-{weekId}/day-{dayNumber}/ folder
      // Also accessible via public/data/files/ for the dev server
      const filePath = `data/files/week-${weekId}/day-${dayNumber}/${file.name}`
      const fileData = {
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        path: filePath,
        uploadedAt: new Date().toISOString()
      }
      handleFileAdd(fileData)
      
      // Also download the file so user can save it to the correct location
      const url = URL.createObjectURL(file)
      const link = document.createElement('a')
      link.href = url
      link.download = file.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      console.log(`📁 File reference created. Please save the downloaded file to: ${filePath}`)
    })
  }

  const handleFileAdd = (fileData) => {
    const currentFiles = day.files || []
    const newFiles = [...currentFiles, fileData]
    console.log('Adding file:', fileData.name, 'Total files:', newFiles.length)
    onUpdate(weekId, dayNumber, 'files', newFiles)
  }

  const handleFileRemove = (fileId) => {
    const currentFiles = day.files || []
    onUpdate(weekId, dayNumber, 'files', currentFiles.filter(f => f.id !== fileId))
  }

  const handleSave = () => {
    if (allWeeks) {
      exportNotesToFile(allWeeks)
      setSaveStatus('Saved!')
      setTimeout(() => setSaveStatus(''), 2000)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <div className="day-container">
      <div className="day-header">
        <div className="day-title">
          <h2>Day {dayNumber}</h2>
          {day.date && (
            <span className="day-date">{formatDate(day.date)}</span>
          )}
        </div>
      </div>

      <div className="day-content">
        <RichTextEditor
          key={`week-${weekId}-day-${dayNumber}`}
          value={day.content || ''}
          onChange={handleChange}
          placeholder="Write your notes here..."
          readOnly={viewerMode}
        />
        
        <FileUpload
          files={day.files || []}
          onFileAdd={handleFileAdd}
          onFileRemove={handleFileRemove}
          weekId={weekId}
          dayNumber={dayNumber}
          readOnly={viewerMode}
        />
        
        {!viewerMode && (
          <div className="day-actions">
            <div className="file-upload-section">
              <div
                className={`file-drop-zone ${isDragging ? 'dragging' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={(e) => {
                    if (e.target.files.length > 0) {
                      handleFileSelect(e.target.files)
                      e.target.value = ''
                    }
                  }}
                  style={{ display: 'none' }}
                />
                <span className="add-file-text">+ add file</span>
              </div>
            </div>
            <button 
              className="day-save-button"
              onClick={handleSave}
              title="Save this day's notes"
            >
              {saveStatus || '✓ Save'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Day

