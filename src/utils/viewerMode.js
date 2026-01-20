/**
 * Check if the app is in viewer mode (read-only)
 * Viewer mode is enabled when:
 * 1. Manual override is set (via localStorage or prop)
 * 2. VITE_VIEWER_MODE environment variable is set to 'true'
 * 3. Or when deployed on Vercel (hostname contains 'vercel.app')
 */

let manualViewerMode = null

export function setManualViewerMode(enabled) {
  manualViewerMode = enabled
  if (typeof window !== 'undefined') {
    if (enabled) {
      localStorage.setItem('rd-viewer-mode', 'true')
    } else {
      localStorage.removeItem('rd-viewer-mode')
    }
  }
}

export function isViewerMode(manualOverride = null) {
  // Check manual override first (from prop or localStorage)
  if (manualOverride !== null) {
    return manualOverride
  }
  
  if (manualViewerMode !== null) {
    return manualViewerMode
  }
  
  // Check localStorage for saved preference
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('rd-viewer-mode')
    if (saved === 'true') {
      manualViewerMode = true
      return true
    }
  }
  
  // Check environment variable
  if (import.meta.env.VITE_VIEWER_MODE === 'true') {
    return true
  }
  
  // Check if deployed on Vercel (for automatic viewer mode on production)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    // Enable viewer mode on Vercel deployments
    if (hostname.includes('vercel.app') || hostname.includes('vercel.com')) {
      return true
    }
  }
  
  return false
}

