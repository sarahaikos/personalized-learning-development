import { useState, useRef } from 'react'
import './FileUpload.css'

function FileUpload({ files = [], onFileAdd, onFileRemove, weekId, dayNumber }) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileSelect = (selectedFiles) => {
    Array.from(selectedFiles).forEach(file => {
      // Store file reference (path) instead of base64 data
      // Files should be placed in data/files/week-{weekId}/day-{dayNumber}/ folder
      const filePath = `data/files/week-${weekId}/day-${dayNumber}/${file.name}`
      const fileData = {
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        path: filePath,
        uploadedAt: new Date().toISOString()
      }
      console.log('File reference created:', fileData.name, 'Path:', filePath)
      onFileAdd(fileData)
      
      // Download file so user can save it to the correct location
      const url = URL.createObjectURL(file)
      const link = document.createElement('a')
      link.href = url
      link.download = file.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      console.log(`📁 Please save the downloaded file to: ${filePath}`)
    })
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

  const handleFileInputChange = (e) => {
    if (e.target.files.length > 0) {
      handleFileSelect(e.target.files)
      e.target.value = '' // Reset input
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const downloadFile = async (file) => {
    // Try to load from file path first, fallback to base64 data if exists
    if (file.path) {
      try {
        const response = await fetch(`/${file.path}`)
        if (response.ok) {
          const blob = await response.blob()
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = file.name
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
          return
        }
      } catch (error) {
        console.warn('Could not load file from path, trying base64 data:', error)
      }
    }
    
    // Fallback to base64 data if path doesn't work
    if (file.data) {
      const link = document.createElement('a')
      link.href = file.data
      link.download = file.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      alert(`File not found at ${file.path}. Please ensure the file is saved in the data folder.`)
    }
  }

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return '🖼️'
    if (type.includes('pdf')) return '📄'
    if (type.includes('word') || type.includes('document')) return '📝'
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊'
    if (type.includes('code') || type.includes('text')) return '💻'
    if (type.includes('zip') || type.includes('archive')) return '📦'
    return '📎'
  }

  return (
    <div className="file-upload-container">
      {files.length > 0 && (
        <div className="uploaded-files">
          <div className="uploaded-files-header">
            <span className="files-count">{files.length} {files.length === 1 ? 'file' : 'files'} attached</span>
          </div>
          <div className="files-list">
            {files.map((file) => (
              <div key={file.id} className="file-item">
                <div className="file-icon">{getFileIcon(file.type)}</div>
                <div className="file-info">
                  <div className="file-name" title={file.name}>{file.name}</div>
                  <div className="file-meta">
                    {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="file-actions">
                  <button
                    className="file-download-btn"
                    onClick={() => downloadFile(file)}
                    title="Download file"
                  >
                    ⬇
                  </button>
                  <button
                    className="file-remove-btn"
                    onClick={() => onFileRemove(file.id)}
                    title="Remove file"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default FileUpload

