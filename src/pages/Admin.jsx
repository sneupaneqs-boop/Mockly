import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean)

export default function Admin() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('PM')
  const [status, setStatus] = useState(null)
  const [accessList, setAccessList] = useState([])

  const isAdmin = ADMIN_EMAILS.includes(user?.email)

  useEffect(() => {
    if (!isAdmin) navigate('/dashboard', { replace: true })
    loadAccess()
  }, [isAdmin])

  async function loadAccess() {
    const { data } = await supabase.from('user_access').select('user_id, subject')
    setAccessList(data || [])
  }

  async function grant(e) {
    e.preventDefault()
    setStatus(null)
    // resolve user id by email via auth.users (requires service role in production;
    // here we store email directly for display and let RLS handle it via a lookup)
    // Since anon key can't query auth.users, we insert with email as a workaround:
    // Use an RPC or store email alongside — for now we store a placeholder and note
    const { data: existing, error: lookupErr } = await supabase
      .from('user_access')
      .select('user_id')
      .eq('user_id', email) // using email as user_id key when user registers

    // Try direct upsert — works when user_id is known; use email as user identifier
    const { error } = await supabase.from('user_access').upsert(
      { user_id: email, subject },
      { onConflict: 'user_id,subject' }
    )
    if (error) {
      setStatus({ type: 'error', msg: error.message })
    } else {
      setStatus({ type: 'success', msg: `Access granted: ${email} → ${subject}` })
      setEmail('')
      loadAccess()
    }
  }

  async function revoke(userId, subj) {
    await supabase.from('user_access').delete().eq('user_id', userId).eq('subject', subj)
    loadAccess()
  }

  if (!isAdmin) return null

  return (
    <div className="min-h-screen" style={{ background: '#f0f4f8' }}>
      <div className="h-14 flex items-center justify-between px-6" style={{ background: '#1a2b4a' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-blue-300 hover:text-white text-sm">← Dashboard</button>
          <span className="text-white font-bold text-lg">Mockly | Admin</span>
        </div>
        <button onClick={() => { logout(); navigate('/login') }} className="text-sm text-white border border-white/30 px-3 py-1 hover:bg-white/10">Sign out</button>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-xl font-bold mb-6" style={{ color: '#1a2b4a' }}>Grant Subject Access</h1>

        <div className="bg-white shadow p-6 mb-6">
          <form onSubmit={grant} className="flex gap-3 items-end flex-wrap">
            <div className="flex-1 min-w-48">
              <label className="block text-xs font-semibold text-gray-600 mb-1">User ID (UUID from Supabase Auth)</label>
              <input
                type="text"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Subject</label>
              <select
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="border border-gray-300 px-3 py-2 text-sm focus:outline-none"
              >
                <option value="PM">PM — Performance Management</option>
                <option value="TAX">TAX — Taxation</option>
              </select>
            </div>
            <button type="submit" className="px-5 py-2 text-sm font-semibold text-white" style={{ background: '#0f4c81' }}>
              Grant Access
            </button>
          </form>

          {status && (
            <div className={`mt-3 p-2 text-sm rounded ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {status.msg}
            </div>
          )}

          <p className="text-xs text-gray-400 mt-3">
            Find user UUIDs in your Supabase dashboard under Authentication → Users.
          </p>
        </div>

        <div className="bg-white shadow p-6">
          <h2 className="text-sm font-bold mb-3" style={{ color: '#1a2b4a' }}>Current Access ({accessList.length})</h2>
          {accessList.length === 0 ? (
            <p className="text-xs text-gray-400">No access records found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs text-gray-500">
                  <th className="text-left py-1">User ID</th>
                  <th className="text-left py-1">Subject</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {accessList.map((row, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-1.5 text-xs text-gray-600 font-mono">{row.user_id}</td>
                    <td className="py-1.5 text-xs font-semibold" style={{ color: '#0f4c81' }}>{row.subject}</td>
                    <td className="py-1.5">
                      <button
                        onClick={() => revoke(row.user_id, row.subject)}
                        className="text-xs text-red-500 hover:underline"
                      >Revoke</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
