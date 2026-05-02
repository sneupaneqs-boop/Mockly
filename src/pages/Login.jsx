import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { if (user) navigate('/dashboard', { replace: true }) }, [user])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await login(email, password)
    setLoading(false)
    if (err) setError(err.message)
    else navigate('/dashboard', { replace: true })
  }

  const S = {
    page: { minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Arial, Helvetica, sans-serif', background: '#f0f4f8' },
    topbar: { height: 56, display: 'flex', alignItems: 'center', padding: '0 28px', background: '#1a2b4a', gap: 12 },
    logo: { color: '#fff', fontWeight: 700, fontSize: 20, letterSpacing: 0.3 },
    tagline: { color: '#7ab3d4', fontSize: 13 },
    body: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 },
    card: { background: '#fff', width: '100%', maxWidth: 400, padding: '36px 40px', boxShadow: '0 4px 24px rgba(0,0,0,0.10)', borderTop: '4px solid #0f4c81' },
    heading: { fontSize: 22, fontWeight: 700, color: '#1a2b4a', marginBottom: 4 },
    sub: { fontSize: 13, color: '#7a9cbd', marginBottom: 28 },
    label: { display: 'block', fontSize: 12, fontWeight: 700, color: '#5a7a9a', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 5 },
    input: { width: '100%', border: '1px solid #c8d4e0', padding: '9px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s', fontFamily: 'Arial' },
    error: { background: '#fef0ee', border: '1px solid #f4a9a0', color: '#b83030', padding: '10px 14px', fontSize: 13, borderRadius: 2, marginBottom: 18 },
    btn: { width: '100%', padding: '11px', fontSize: 14, fontWeight: 700, background: '#0f4c81', color: '#fff', border: 'none', cursor: 'pointer', letterSpacing: 0.3, marginTop: 8, transition: 'background 0.15s' },
  }

  return (
    <div style={S.page}>
      <div style={S.topbar}>
        <span style={S.logo}>Mockly</span>
        <span style={{ color: '#3a5a7a', fontSize: 16 }}>|</span>
        <span style={S.tagline}>ACCA CBE Practice Platform</span>
      </div>

      <div style={S.body}>
        <div style={S.card}>
          <div style={S.heading}>Sign In</div>
          <div style={S.sub}>Access your ACCA practice materials</div>

          {error && <div style={S.error}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={S.label}>Email Address</label>
              <input
                type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                style={S.input}
                placeholder="you@example.com"
                onFocus={e => e.target.style.borderColor = '#0f4c81'}
                onBlur={e => e.target.style.borderColor = '#c8d4e0'}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={S.label}>Password</label>
              <input
                type="password" required value={password}
                onChange={e => setPassword(e.target.value)}
                style={S.input}
                placeholder="••••••••"
                onFocus={e => e.target.style.borderColor = '#0f4c81'}
                onBlur={e => e.target.style.borderColor = '#c8d4e0'}
              />
            </div>
            <button
              type="submit" disabled={loading} style={{ ...S.btn, opacity: loading ? 0.7 : 1 }}
              onMouseEnter={e => e.target.style.background = '#0d3d68'}
              onMouseLeave={e => e.target.style.background = '#0f4c81'}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #e8eff5', fontSize: 12, color: '#9ab3cc', textAlign: 'center' }}>
            Contact your administrator for account access
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div style={{ position: 'fixed', bottom: 0, right: 0, width: 400, height: 400, background: 'radial-gradient(circle, rgba(15,76,129,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
    </div>
  )
}
