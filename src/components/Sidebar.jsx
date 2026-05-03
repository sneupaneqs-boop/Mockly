import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Icons } from './Icons'

const NAV_STUDY = [
  { path: '/dashboard', label: 'Home & practice', icon: Icons.home },
  { path: '/mock/create', label: 'Take a mock', icon: Icons.flask },
  { path: '/history', label: 'History', icon: Icons.history },
  { path: '/weak-areas', label: 'Weak area drill', icon: Icons.target },
]
const NAV_LIB = [
  { path: '/topics', label: 'Topics', icon: Icons.book },
  { path: '/leaderboard', label: 'Leaderboard', icon: Icons.trophy },
]

export default function Sidebar({ streak = 7, mockCount = 0 }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  function isActive(path) {
    if (path === '/dashboard') return pathname === '/dashboard' || pathname === '/'
    return pathname.startsWith(path)
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">M</div>
        <div className="brand-name">mockly<span className="dot">.</span></div>
      </div>

      <div className="nav-section-label">Study</div>
      {NAV_STUDY.map(item => (
        <div
          key={item.path}
          className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          <span className="icon"><item.icon size={17}/></span>
          {item.label}
          {item.path === '/history' && mockCount > 0 && (
            <span className="badge">{mockCount}</span>
          )}
        </div>
      ))}

      <div className="nav-section-label">Library</div>
      {NAV_LIB.map(item => (
        <div
          key={item.path}
          className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          <span className="icon"><item.icon size={17}/></span>
          {item.label}
        </div>
      ))}

      <div className="sidebar-footer">
        <div className="streak-card">
          <div className="streak-flame">🔥</div>
          <div className="streak-meta">
            <b>{streak}-day streak</b>
            <span>Keep it alive · 1 mock today</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
