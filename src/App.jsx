import React from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import SendOptions from './components/SendOptions'
import SendForm from './components/SendForm'
import ReceiveForm from './components/ReceiveForm'
import { ToastProvider } from './components/ToastContext'

export default function App() {
  const navigate = useNavigate()

  return (
  <ToastProvider>
  <div className="app">
      <header className="header">
        <h1 className="title" onClick={() => navigate('/')}>QuickShare App</h1>
        <nav>
          <button className="btn" onClick={() => navigate('/send')}>Send</button>
          <button className="btn btn-outline" onClick={() => navigate('/receive')}>Receive</button>
        </nav>
      </header>

      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/send" element={<SendOptions />} />
          <Route path="/send/one" element={<SendForm multiple={false} />} />
          <Route path="/send/multiple" element={<SendForm multiple={true} />} />
          <Route path="/receive" element={<ReceiveForm />} />
        </Routes>
      </main>

      <footer className="footer">Made with ❤️ — QuickShare</footer>
    </div>
    </ToastProvider>
  )
}

function Home() {
  return (
    <div className="home">
      <p>Choose Send to upload files or Receive to download using a token.</p>
      <div className="home-choices">
        <Link to="/send" className="choice-btn" aria-label="Send files">
          <span className="choice-icon" aria-hidden>📤</span>
          <span>Send</span>
        </Link>

        <Link to="/receive" className="choice-btn secondary" aria-label="Receive files">
          <span className="choice-icon" aria-hidden>📥</span>
          <span>Receive</span>
        </Link>
      </div>
    </div>
  )
}
