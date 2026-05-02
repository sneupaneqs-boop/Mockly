import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'

const SUBJECTS = [
  {
    code: 'PM', name: 'Performance Management',
    description: 'Management accounting, decision making, performance measurement & control systems',
    topics: 'Cost accounting, CVP analysis, Budgeting, Variance analysis, Performance measurement',
    color: '#0f4c81',
  },
  {
    code: 'TAX', name: 'Taxation',
    description: 'UK tax system covering income tax, corporation tax, VAT and other taxes',
    topics: 'Income tax, Corporation tax, Capital gains tax, VAT, Tax planning',
    color: '#1a7a5a',
  },
]

function SubjectCard({ subject, unlocked, onStart }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: unlocked ? '#fff' : '#f8f9fb',
        border: `1px solid ${hovered && unlocked ? subject.color : '#d8e2ee'}`,
        borderRadius: 4,
        padding: '28px 28px 24px',
        transition: 'all 0.2s',
        boxShadow: hovered && unlocked ? '0 4px 16px rgba(15,76,129,0.12)' : '0 1px 4px rgba(0,0,0,0.04)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top accent */}
      {unlocked && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: subject.color }} />}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: unlocked ? subject.color : '#9ab3cc', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
            ACCA — {subject.code}
          </div>
          <div style={{ fontSize: 19, fontWeight: 700, color: unlocked ? '#1a2b4a' : '#9ab3cc' }}>{subject.name}</div>
        </div>
        {!unlocked && (
          <div style={{ width: 36, height: 36, background: '#e8eff5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ab3cc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
        )}
      </div>

      <p style={{ fontSize: 13, color: unlocked ? '#5a7a9a' : '#b0c0cc', lineHeight: 1.6, marginBottom: 10 }}>
        {subject.description}
      </p>

      <div style={{ fontSize: 11, color: unlocked ? '#9ab3cc' : '#c0d0da', marginBottom: 20, lineHeight: 1.5 }}>
        {subject.topics}
      </div>

      {unlocked ? (
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => onStart('practice')}
            style={{ flex: 1, padding: '9px 0', fontSize: 13, fontWeight: 700, background: subject.color, color: '#fff', border: 'none', cursor: 'pointer', borderRadius: 2, letterSpacing: 0.2 }}
          >
            Browse Questions
          </button>
          <button
            onClick={() => onStart('mock')}
            style={{ flex: 1, padding: '9px 0', fontSize: 13, fontWeight: 700, background: '#fff', color: subject.color, border: `2px solid ${subject.color}`, cursor: 'pointer', borderRadius: 2 }}
          >
            Take Mock
          </button>
        </div>
      ) : (
        <div style={{ fontSize: 12, color: '#9ab3cc', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>🔒</span> Contact administrator to unlock
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [access, setAccess] = useState([])
  const [loading, setLoading] = useState(true)
  const [recentMocks, setRecentMocks] = useState([])

  const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean)
  const isAdmin = adminEmails.includes(user?.email)

  useEffect(() => {
    if (!user) return
    Promise.all([
      supabase.from('user_access').select('subject').eq('user_id', user.id),
      supabase.from('mock_sessions').select('id, subject, created_at, completed_at, score_a, score_b').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
    ]).then(([{ data: acc }, { data: mocks }]) => {
      setAccess((acc || []).map(r => r.subject))
      setRecentMocks(mocks || [])
      setLoading(false)
    })
  }, [user])

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', fontFamily: 'Arial, Helvetica, sans-serif' }}>
      {/* Top bar */}
      <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', background: '#1a2b4a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 18, letterSpacing: 0.3 }}>Mockly</span>
          <span style={{ color: '#3a5a7a' }}>|</span>
          <span style={{ color: '#7ab3d4', fontSize: 13 }}>ACCA CBE Practice Platform</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {isAdmin && (
            <button onClick={() => navigate('/admin')} style={{ color: '#7ab3d4', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, padding: 0, textDecoration: 'underline' }}>Admin</button>
          )}
          <span style={{ color: '#7a9cbd', fontSize: 13 }}>{user?.email}</span>
          <button
            onClick={() => { logout(); navigate('/login') }}
            style={{ fontSize: 12, color: '#c8d8e8', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '5px 14px', cursor: 'pointer', borderRadius: 2 }}
          >Sign out</button>
        </div>
      </div>

      <div style={{ maxWidth: 980, margin: '0 auto', padding: '32px 20px' }}>
        {/* Welcome */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a2b4a', margin: 0 }}>Dashboard</h1>
          <p style={{ fontSize: 13, color: '#7a9cbd', margin: '4px 0 0' }}>Welcome back — select a subject to practise or create a mock exam</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#9ab3cc' }}>Loading your access…</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20, marginBottom: 32 }}>
            {SUBJECTS.map(sub => (
              <SubjectCard
                key={sub.code}
                subject={sub}
                unlocked={access.includes(sub.code)}
                onStart={(type) => {
                  if (type === 'practice') navigate(`/subject/${sub.code}`)
                  else navigate('/mock/create', { state: { subject: sub.code } })
                }}
              />
            ))}
          </div>
        )}

        {/* Recent mocks */}
        {recentMocks.length > 0 && (
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1a2b4a', marginBottom: 12 }}>Recent Mock Exams</h2>
            <div style={{ background: '#fff', border: '1px solid #d8e2ee', borderRadius: 4, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f0f4f8', borderBottom: '1px solid #d8e2ee' }}>
                    {['Subject', 'Date', 'Status', 'Score A', 'Score B', ''].map(h => (
                      <th key={h} style={{ padding: '8px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#5a7a9a', textTransform: 'uppercase', letterSpacing: 0.4 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentMocks.map(m => (
                    <tr key={m.id} style={{ borderBottom: '1px solid #e8eff5' }}>
                      <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 700, color: '#0f4c81' }}>{m.subject}</td>
                      <td style={{ padding: '10px 14px', fontSize: 12, color: '#5a7a9a' }}>{new Date(m.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: m.completed_at ? '#eafaf1' : '#fff8e0', color: m.completed_at ? '#1a7a45' : '#a06000' }}>
                          {m.completed_at ? '✓ Complete' : '⏸ In Progress'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: 13, color: '#1a2b4a', fontWeight: m.score_a != null ? 600 : 400 }}>
                        {m.score_a != null ? `${m.score_a}/30` : '—'}
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: 13, color: '#1a2b4a', fontWeight: m.score_b != null ? 600 : 400 }}>
                        {m.score_b != null ? `${m.score_b}/30` : '—'}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <button
                          onClick={() => navigate(m.completed_at ? `/mock/${m.id}/results` : `/mock/${m.id}`)}
                          style={{ fontSize: 11, color: '#0f4c81', background: '#e8f0f8', border: 'none', padding: '3px 10px', cursor: 'pointer', borderRadius: 2 }}
                        >
                          {m.completed_at ? 'View Results' : 'Continue'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
