import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function SendOptions() {
  const navigate = useNavigate()
  return (
    <div className="card send-options">
      <div className="send-left">
        <div className="icon-circle" aria-hidden>
          📤
        </div>
      </div>

      <div className="send-right">
        <h2>Share files instantly</h2>
        <p className="muted">Upload your file(s) and get a secure download link and QR code that expires in 10 minutes.</p>

        <div className="options-cta">
          <button className="btn" onClick={() => navigate('/send/one')}>Send One File</button>
          <button className="btn btn-outline" onClick={() => navigate('/send/multiple')}>Send Multiple</button>
        </div>
      </div>
    </div>
  )
}
