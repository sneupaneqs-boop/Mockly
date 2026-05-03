import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { Icons } from './Icons'

export default function Topbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const initials = user?.email
    ? user.email.split('@')[0].slice(0, 2).toUpperCase()
    : 'SN'

  const displayName = user?.email?.split('@')[0] || 'Student'

  return (
    <div className="topbar">
      <div className="search">
        <Icons.search size={15}/>
        <input placeholder="Search topics, past questions, mocks…"/>
        <kbd>⌘K</kbd>
      </div>
      <div className="top-actions">
        <button className="icon-btn" title="Notifications">
          <Icons.bell size={16}/>
          <span className="dot"/>
        </button>
        <div className="user-chip">
          <div className="avatar">{initials}</div>
          <div className="meta">
            <b>{displayName}</b>
            <span>PM · Sep '26</span>
          </div>
        </div>
        <button
          className="btn btn-sm"
          onClick={() => { logout(); navigate('/login') }}
          style={{ fontSize: 11, padding: '5px 10px' }}
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
