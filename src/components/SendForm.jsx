import React, { useState, useRef } from 'react'
import { useToast } from './ToastContext'

const API_BASE = 'https://share-app-backend.onrender.com/api'

export default function SendForm({ multiple = false }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const toast = useToast()
  const inputRef = useRef()

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const dropped = Array.from(e.dataTransfer.files)
    setFiles(multiple ? dropped : dropped.slice(0, 1))
  }

  function handleSelect(e) {
    const selected = Array.from(e.target.files)
    setFiles(multiple ? selected : selected.slice(0, 1))
  }

  async function handleSubmit(e) {
    e && e.preventDefault()
    if (files.length === 0) {
      toast.error('Please choose at least one file')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const form = new FormData()
      if (multiple) {
        // backend expects the multipart field name to be 'files'
        files.forEach(f => form.append('files', f))
      } else {
        form.append('file', files[0])
      }
      const url = multiple ? `${API_BASE}/upload-multiple/` : `${API_BASE}/upload/`
      const res = await fetch(url, { method: 'POST', body: form })
      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || res.statusText)
      }
      const data = await res.json()
      // expected fields: token, download_url (maybe), files
      setResult(data)
      toast.success('Upload successful')
    } catch (err) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  function copyLink() {
    if (!result) return
    const link = result.download_url || `${API_BASE.replace('/api','')}/api/download/${result.token}`
    navigator.clipboard.writeText(link)
    .then(() => toast.success('Link copied to clipboard'))
    .catch(() => toast.error('Failed to copy'))
  }

  async function shareLink() {
    if (!result) return
    const link = result.download_url || `${API_BASE.replace('/api','')}/api/download/${result.token}`
    // Use Web Share API when available, otherwise fall back to copying the link
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Download link', text: 'Download your file', url: link })
        toast.success('Shared successfully')
      } catch (err) {
        // user cancelled or share failed
        if (err && err.name !== 'AbortError') toast.error('Share failed')
      }
    } else {
      try {
        await navigator.clipboard.writeText(link)
        toast.info('Share not supported — link copied to clipboard')
      } catch (_) {
        toast.error('Unable to share or copy link')
      }
    }
  }

  async function forceDownload() {
    if (!result) return
    // Open the direct download link in a new tab so the browser preserves format/headers (PDF stays PDF)
    const url = result.download_url || `${API_BASE.replace('/api','')}/api/download/${result.token}`
    try {
      const w = window.open(url, '_blank', 'noopener')
      if (!w) {
        // popup blocked - fallback: copy link and notify user
        await navigator.clipboard.writeText(url)
        toast.info('Popup blocked — download link copied to clipboard')
        return
      }
    } catch (err) {
      // best-effort fallback
      await navigator.clipboard.writeText(url).catch(()=>{})
      toast.error('Unable to open download link — link copied to clipboard')
    }
  }

  return (
    <div className="card">
      <h2>{multiple ? 'Send Multiple Files' : 'Send One File'}</h2>
      <form onSubmit={handleSubmit} className="upload-form">
        <div
          role="button"
          tabIndex={0}
          aria-label="File upload dropzone. Press Enter to open file selector."
          className={`dropzone ${dragOver ? 'dragover' : ''}`}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onDragEnter={() => setDragOver(true)}
          onDragLeave={() => setDragOver(false)}
          onClick={e => {
            // Only trigger when clicking the dropzone itself (not children)
            if (e.target === e.currentTarget) {
              inputRef.current && inputRef.current.click()
            }
          }}
          onKeyDown={e => {
            if ((e.key === 'Enter' || e.key === ' ') && e.target === e.currentTarget) {
              e.preventDefault()
              inputRef.current && inputRef.current.click()
            }
          }}
        >
          <p>Drag & drop files here, or press Enter to browse</p>
          <input
            ref={inputRef}
            type="file"
            onChange={handleSelect}
            multiple={multiple}
            className="file-input"
          />
          <button
            type="button"
            className="btn btn-outline"
            onClick={e => {
              // stop propagation so the dropzone handler isn't invoked twice
              e.stopPropagation()
              inputRef.current && inputRef.current.click()
            }}
          >
            Choose Files
          </button>
        </div>

        {files.length > 0 && (
          <div className="file-list">
            {files.map((f, i) => (
              <div key={i} className="file-chip" tabIndex={0} aria-label={`Selected file ${f.name}`}>
                <span>{f.name}</span>
                <span className="size">{Math.round(f.size/1024)} KB</span>
              </div>
            ))}
          </div>
        )}

        <div className="actions">
          <button className="btn" type="submit" disabled={loading}>{loading ? 'Uploading...' : 'Upload'}</button>
        </div>
      </form>

      {/* errors handled by global toasts */}
      {result && (
        <div className="result">
          {/* Heading removed per UX: only show token value and QR */}
          <p className="token-value">{result.token}</p>
          {result.files && result.files.length > 0 && (
            <div>
              <strong>Files:</strong>
              <ul>
                {result.files.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </div>
          )}

          {/* On the Send page we only show token info and QR — hide direct link and action buttons */}
          <div className="result-actions" style={{justifyContent: 'center', marginTop: 8}}>
            <img className="qr" src={`${API_BASE}/qr-code/${result.token}`} alt="QR code" />
            <div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
              <button className='btn btn-outline' onClick={shareLink}>Share Link</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
