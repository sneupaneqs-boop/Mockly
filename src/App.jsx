import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Subject from './pages/Subject'
import MockCreate from './pages/MockCreate'
import Mock from './pages/Mock'
import MockResults from './pages/MockResults'
import Admin from './pages/Admin'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/subject/:subject" element={<ProtectedRoute><Subject /></ProtectedRoute>} />
          <Route path="/mock/create" element={<ProtectedRoute><MockCreate /></ProtectedRoute>} />
          <Route path="/mock/:id" element={<ProtectedRoute><Mock /></ProtectedRoute>} />
          <Route path="/mock/:id/results" element={<ProtectedRoute><MockResults /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
