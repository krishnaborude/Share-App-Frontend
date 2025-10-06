import React, { useState, useEffect } from 'react'
import { useToast } from './ToastContext'
import { parseFilename } from '../utils/contentDisposition'

const API_BASE = 'https://share-app-backend.onrender.com/api'

export default function ReceiveForm() {
  const [token, setToken] = useState('')
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // no object URLs — we won't fetch file body to avoid changing format
  const toast = useToast()

  useEffect(() => {
    // keep effect placeholder if we later need to react to `info` changes
  }, [info])

  async function handleDownload(e) {
    e && e.preventDefault()
    const t = (token || '').trim()
    if (!t) { toast.error('Please enter a token'); return }
    // normalize token in the input so users see the trimmed value
    if (t !== token) setToken(t)
    toast.info('Checking token...')
    setLoading(true)
    setInfo(null)
    try {
      // Prefer HEAD so we don't download the file body and change format
      console.debug('handleDownload: checking token', t)
      const headRes = await fetch(`${API_BASE}/download/${t}`, { method: 'HEAD' })
      // direct download URL we'll want to open or expose to the UI
      const downloadUrl = `${API_BASE.replace('/api','')}/api/download/${t}`
      console.debug('handleDownload: HEAD status', headRes.status)
      if (headRes.ok) {
        // attempt to read filename from headers
        const contentDisp = headRes.headers.get('content-disposition') || ''
        const inferred = parseFilename(contentDisp)
        setInfo({ download_url: downloadUrl, token: t, filename: inferred })
        toast.success('Token valid — starting download')
        // open the download in a new tab so browser handles file format
        console.debug('handleDownload: opening', downloadUrl)
        await openLink(downloadUrl)
        return
      }

      // Handle common error statuses from HEAD
      if (headRes.status === 404) throw new Error('Token not found or expired')
      if (headRes.status === 422) {
        // try to parse body for message if backend returns it
        try {
          const json = await headRes.json()
          const msg = json.detail?.[0]?.msg || 'Invalid request'
          throw new Error(msg)
        } catch (_) {
          throw new Error('Invalid request')
        }
      }
      if (headRes.status === 500) {
        // surface backend message if present
        try {
          const txt = await headRes.text()
          throw new Error(txt || 'Server error: token may be used, expired, or invalid')
        } catch (_) {
          throw new Error('Server error: token may be used, expired, or invalid')
        }
      }

      // If server doesn't support HEAD (405) or returned another status, still present the direct link
      if (headRes.status === 405) {
        // Server doesn't support HEAD; still expose the direct link and open it immediately
        setInfo({ download_url: downloadUrl, token: t })
        console.debug('handleDownload: HEAD not supported, opening', downloadUrl)
        await openLink(downloadUrl)
        return
      }

      const txt = await headRes.text()
      throw new Error(txt || headRes.statusText || 'Failed to validate token')
    } catch (err) {
      console.error('handleDownload error for token', token, err)
      toast.error(err.message || 'Failed to retrieve file')
    } finally {
      setLoading(false)
    }
  }

  async function forceDownload() {
    const t = (token || '').trim()
    if (!t) { toast.error('Please enter a token'); return }
    if (t !== token) setToken(t)
    toast.info('Starting download...')
    setLoading(true)
    try {
      // Open the direct download URL in a new tab so the browser handles the file format (PDF preserved)
      const url = `${API_BASE.replace('/api','')}/api/download/${t}`
      console.debug('forceDownload opening', url)
      await openLink(url)
    } catch (err) {
      console.error('forceDownload error for token', token, err)
      toast.error(err.message || 'Download failed')
    } finally {
      setLoading(false)
    }
  }

  // Try to open a URL in a new tab. Prefer window.open (user gesture),
  // fall back to programmatic anchor click, and finally fallback to copying the link.
  async function openLink(url) {
    try {
      const w = window.open(url, '_blank', 'noopener')
      if (w) return
    } catch (err) {
      // ignore and try anchor fallback
    }

    try {
      const a = document.createElement('a')
      a.href = url
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
      // append so click works in some browsers
      document.body.appendChild(a)
      a.click()
      a.remove()
      return
    } catch (err) {
      // ignore and fall through to clipboard
    }

    try {
      await navigator.clipboard.writeText(url)
      toast.info('Popup blocked — download link copied to clipboard')
    } catch (_) {
      toast.error('Unable to open or copy download link')
    }
  }

  // Button click handler: if we've already resolved info with a download_url,
  // open that directly; otherwise run the HEAD-checking flow in handleDownload.
  async function handleDownloadClick(e) {
    e && e.preventDefault()
    const t = (token || '').trim()
    if (!t) { toast.error('Please enter a token'); return }
    if (t !== token) setToken(t)
    // Construct direct download URL immediately and attempt to open it.
    const url = `${API_BASE.replace('/api','')}/api/download/${t}`
    setLoading(true)
    try {
      setInfo(prev => ({ ...(prev || {}), download_url: url, token: t }))
      await openLink(url)
    } catch (err) {
      console.error('handleDownloadClick error for token', t, err)
      toast.error(err?.message || 'Failed to open download link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card receive-card">
      <div className="receive-left">
        <div className="icon-circle" aria-hidden>📥</div>
        <h2>Receive File</h2>
        <p className="muted">Enter the token you received to access the file.</p>
      </div>

      <div className="receive-right">
        <form onSubmit={handleDownload} className="receive-form">
          <label className="sr-only" htmlFor="token-input">Enter token</label>
          <div className="token-row">
            <input id="token-input" value={token} onChange={e => setToken(e.target.value)} placeholder="eg. XYZ12ABC" aria-label="Token input" />
            <button
              type="button"
              className="btn"
              disabled={loading}
              aria-disabled={loading}
              onClick={handleDownloadClick}
            >
              {loading ? 'Checking...' : 'Download'}
            </button>
          </div>
        </form>

        {/* error state handled by global toasts */}

        {/* Removed detailed link/token/QR UI per request */}
      </div>
    </div>
  )
}
