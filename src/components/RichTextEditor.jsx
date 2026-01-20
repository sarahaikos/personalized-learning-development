import { useRef, useEffect, useState } from 'react'
import './RichTextEditor.css'

function RichTextEditor({ value, onChange, placeholder, label, readOnly = false }) {
  const editorRef = useRef(null)
  const toolbarRef = useRef(null)
  const [showToolbar, setShowToolbar] = useState(false)
  const [showInlineToolbar, setShowInlineToolbar] = useState(false)
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 })
  const [inlineToolbarPosition, setInlineToolbarPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (editorRef.current) {
      // Always sync with value prop to ensure isolation
      if (value !== undefined && editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || ''
      } else if (!value) {
        editorRef.current.innerHTML = ''
      }
    }
  }, [value])

  const handleInput = (e) => {
    if (readOnly) return
    const content = e.target.innerHTML
    onChange(content)
  }

  const handleKeyDown = (e) => {
    if (readOnly) return
    // Check if user typed "->" to create an arrow
    if (e.key === '>' && editorRef.current) {
      const selection = window.getSelection()
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        const textNode = range.startContainer
        
        if (textNode && textNode.nodeType === Node.TEXT_NODE) {
          const text = textNode.textContent || ''
          const cursorPos = range.startOffset
          
          // Check if the character before cursor is "-"
          if (cursorPos > 0 && text[cursorPos - 1] === '-') {
            e.preventDefault()
            
            // Replace "-" with arrow character "→"
            const newText = text.slice(0, cursorPos - 1) + '→' + text.slice(cursorPos)
            textNode.textContent = newText
            
            // Move cursor after the arrow
            const newRange = document.createRange()
            newRange.setStart(textNode, cursorPos)
            newRange.collapse(true)
            selection.removeAllRanges()
            selection.addRange(newRange)
            
            handleInput({ target: editorRef.current })
          }
        }
      }
    }
  }

  const formatText = (command, value = null) => {
    if (readOnly) return
    document.execCommand(command, false, value)
    if (editorRef.current) {
      editorRef.current.focus()
      handleInput({ target: editorRef.current })
    }
    setShowToolbar(false)
  }

  useEffect(() => {
    if (readOnly) return
    const handleKeyboardShortcuts = (e) => {
      // Handle keyboard shortcuts
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
        if (e.key === 'b') {
          e.preventDefault()
          formatText('bold')
        } else if (e.key === 'i') {
          e.preventDefault()
          formatText('italic')
        }
      }
    }

    const editor = editorRef.current
    if (editor) {
      editor.addEventListener('keydown', handleKeyboardShortcuts)
      return () => editor.removeEventListener('keydown', handleKeyboardShortcuts)
    }
  }, [readOnly])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        toolbarRef.current &&
        !toolbarRef.current.contains(event.target) &&
        editorRef.current &&
        !editorRef.current.contains(event.target)
      ) {
        setShowToolbar(false)
        setShowInlineToolbar(false)
      }
    }

    if (showToolbar || showInlineToolbar) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showToolbar, showInlineToolbar])

  const handleSelection = () => {
    if (readOnly) return
    const selection = window.getSelection()
    if (selection.rangeCount > 0 && !selection.isCollapsed) {
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      setToolbarPosition({
        top: rect.top + scrollTop - 50,
        left: rect.left + rect.width / 2
      })
      setShowToolbar(true)
    } else {
      setShowToolbar(false)
    }
  }

  const handleClick = (e) => {
    if (readOnly) return
    // Show inline toolbar when clicking in editor
    if (editorRef.current && editorRef.current.contains(e.target)) {
      const rect = editorRef.current.getBoundingClientRect()
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      setInlineToolbarPosition({
        top: rect.top + scrollTop - 45,
        left: rect.left + 10
      })
      setShowInlineToolbar(true)
    }
  }

  const insertList = (ordered = false) => {
    if (readOnly) return
    const command = ordered ? 'insertOrderedList' : 'insertUnorderedList'
    formatText(command)
  }


  const insertCodeBlock = () => {
    if (readOnly) return
    const selection = window.getSelection()
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const codeBlock = document.createElement('pre')
      codeBlock.className = 'code-block'
      codeBlock.contentEditable = true
      const selectedText = selection.toString()
      
      try {
        if (selectedText) {
          range.deleteContents()
        }
        if (!selectedText) {
          codeBlock.textContent = '// Your code here'
        } else {
          codeBlock.textContent = selectedText
        }
        range.insertNode(codeBlock)
        
        // Move cursor inside code block
        const newRange = document.createRange()
        newRange.selectNodeContents(codeBlock)
        newRange.collapse(false)
        selection.removeAllRanges()
        selection.addRange(newRange)
        
        codeBlock.focus()
        handleInput({ target: editorRef.current })
      } catch (e) {
        console.error('Error inserting code block:', e)
      }
    }
    setShowToolbar(false)
  }

  const insertLink = () => {
    if (readOnly) return
    const selection = window.getSelection()
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const selectedText = selection.toString()
      
      // Prompt for URL
      const url = prompt('Enter URL:', selectedText ? '' : 'https://')
      
      if (url && url.trim()) {
        try {
          // Ensure URL has protocol
          let finalUrl = url.trim()
          if (!finalUrl.match(/^https?:\/\//i)) {
            finalUrl = 'https://' + finalUrl
          }
          
          // Create link element
          const link = document.createElement('a')
          link.href = finalUrl
          link.target = '_blank'
          link.rel = 'noopener noreferrer'
          link.textContent = selectedText || finalUrl
          link.className = 'editor-link'
          
          // If text is selected, replace it with link
          if (selectedText && !range.collapsed) {
            range.deleteContents()
          }
          
          range.insertNode(link)
          
          // Move cursor after the link
          const newRange = document.createRange()
          newRange.setStartAfter(link)
          newRange.collapse(true)
          selection.removeAllRanges()
          selection.addRange(newRange)
          
          handleInput({ target: editorRef.current })
        } catch (e) {
          console.error('Error inserting link:', e)
        }
      }
    } else {
      // No selection - prompt for both text and URL
      const linkText = prompt('Enter link text:')
      if (linkText) {
        const url = prompt('Enter URL:', 'https://')
        if (url && url.trim()) {
          try {
            let finalUrl = url.trim()
            if (!finalUrl.match(/^https?:\/\//i)) {
              finalUrl = 'https://' + finalUrl
            }
            
            const link = document.createElement('a')
            link.href = finalUrl
            link.target = '_blank'
            link.rel = 'noopener noreferrer'
            link.textContent = linkText
            link.className = 'editor-link'
            
            if (editorRef.current) {
              const range = document.createRange()
              const selection = window.getSelection()
              
              // Insert at cursor position
              if (selection.rangeCount > 0) {
                range.setStart(selection.getRangeAt(0).startContainer, selection.getRangeAt(0).startOffset)
              } else {
                range.selectNodeContents(editorRef.current)
                range.collapse(false)
              }
              
              range.insertNode(link)
              
              // Move cursor after link
              const newRange = document.createRange()
              newRange.setStartAfter(link)
              newRange.collapse(true)
              selection.removeAllRanges()
              selection.addRange(newRange)
              
              handleInput({ target: editorRef.current })
            }
          } catch (e) {
            console.error('Error inserting link:', e)
          }
        }
      }
    }
    setShowToolbar(false)
  }

  return (
    <div className="rich-text-editor">
      {label && <div className="editor-label">{label}</div>}
      <div className="editor-wrapper">
        {!readOnly && (
          <div className="persistent-toolbar">
            <button
              type="button"
              className="toolbar-btn"
              onClick={() => formatText('bold')}
              title="Bold (Ctrl+B)"
            >
              <strong>B</strong>
            </button>
            <button
              type="button"
              className="toolbar-btn"
              onClick={() => formatText('italic')}
              title="Italic (Ctrl+I)"
            >
              <em>I</em>
            </button>
            <button
              type="button"
              className="toolbar-btn"
              onClick={insertLink}
              title="Insert Link"
            >
              🔗
            </button>
            <button
              type="button"
              className="toolbar-btn"
              onClick={() => insertList(false)}
              title="Bullet List"
            >
              •
            </button>
            <button
              type="button"
              className="toolbar-btn"
              onClick={() => insertList(true)}
              title="Numbered List"
            >
              1.
            </button>
            <button
              type="button"
              className="toolbar-btn"
              onClick={insertCodeBlock}
              title="Code Block"
            >
              {'</>'}
            </button>
          </div>
        )}
        {!readOnly && showToolbar && (
          <div 
            ref={toolbarRef}
            className="formatting-toolbar"
            style={{
              top: `${toolbarPosition.top}px`,
              left: `${toolbarPosition.left}px`
            }}
          >
            <button
              type="button"
              className="toolbar-btn"
              onClick={() => formatText('bold')}
              title="Bold"
            >
              <strong>B</strong>
            </button>
            <button
              type="button"
              className="toolbar-btn"
              onClick={() => formatText('italic')}
              title="Italic"
            >
              <em>I</em>
            </button>
            <button
              type="button"
              className="toolbar-btn"
              onClick={insertCodeBlock}
              title="Code Block"
            >
              {'</>'}
            </button>
          </div>
        )}
        {!readOnly && showInlineToolbar && (
          <div 
            ref={toolbarRef}
            className="inline-formatting-toolbar"
            style={{
              top: `${inlineToolbarPosition.top}px`,
              left: `${inlineToolbarPosition.left}px`
            }}
          >
            <button
              type="button"
              className="toolbar-btn"
              onClick={() => formatText('bold')}
              title="Bold (Ctrl+B)"
            >
              <strong>B</strong>
            </button>
            <button
              type="button"
              className="toolbar-btn"
              onClick={() => formatText('italic')}
              title="Italic (Ctrl+I)"
            >
              <em>I</em>
            </button>
            <button
              type="button"
              className="toolbar-btn"
              onClick={insertLink}
              title="Insert Link"
            >
              🔗
            </button>
            <button
              type="button"
              className="toolbar-btn"
              onClick={() => insertList(false)}
              title="Bullet List"
            >
              •
            </button>
            <button
              type="button"
              className="toolbar-btn"
              onClick={() => insertList(true)}
              title="Numbered List"
            >
              1.
            </button>
            <button
              type="button"
              className="toolbar-btn"
              onClick={insertCodeBlock}
              title="Code Block"
            >
              {'</>'}
            </button>
          </div>
        )}
        <div
          ref={editorRef}
          className={`editor-content ${readOnly ? 'read-only' : ''}`}
          contentEditable={!readOnly}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onMouseUp={handleSelection}
          onKeyUp={handleSelection}
          onClick={handleClick}
          data-placeholder={placeholder}
          suppressContentEditableWarning
        />
      </div>
    </div>
  )
}

export default RichTextEditor

