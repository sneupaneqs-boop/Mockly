import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Subject from './pages/Subject'
import MockCreate from './pages/MockCreate'
import Mock from './pages/Mock'
import MockResults from './pages/MockResults'
import History from './pages/History'
import Topics from './pages/Topics'
import WeakAreas from './pages/WeakAreas'
import Leaderboard from './pages/Leaderboard'
import Admin from './pages/Admin'

// Pages that get the full-screen treatment (no sidebar/topbar)
const FULLSCREEN_PATHS = ['/login', '/mock/']

function AppShell() {
  const { pathname } = useLocation()
  const isFullscreen = FULLSCREEN_PATHS.some(p => pathname.startsWith(p)) && !pathname.includes('/results')

  if (isFullscreen) {
    return (
      <div className="app fullscreen">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/mock/:id" element={<ProtectedRoute><Mock /></ProtectedRoute>} />
        </Routes>
      </div>
    )
  }

  return (
    <div className="app">
      <Sidebar streak={7}/>
      <div className="main">
        <Topbar/>
        <Routes>
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/topics" element={<ProtectedRoute><Topics /></ProtectedRoute>} />
          <Route path="/weak-areas" element={<ProtectedRoute><WeakAreas /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          <Route path="/subject/:subject" element={<ProtectedRoute><Subject /></ProtectedRoute>} />
          <Route path="/mock/create" element={<ProtectedRoute><MockCreate /></ProtectedRoute>} />
          <Route path="/mock/:id/results" element={<ProtectedRoute><MockResults /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  )
}
