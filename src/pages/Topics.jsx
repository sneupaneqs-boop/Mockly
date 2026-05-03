import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { Icons } from '../components/Icons'
import { useTopicPerformance } from '../lib/useTopicPerformance'

export default function Topics() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const { topics, loading } = useTopicPerformance(user?.id)

  const filtered = topics.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  )

  const attempted = filtered.filter(t => t.total > 0)
  const untried = filtered.filter(t => t.total === 0)

  const weak = attempted.filter(t => t.strength < 50)
  const mid = attempted.filter(t => t.strength >= 50 && t.strength < 70)
  const strong = attempted.filter(t => t.strength >= 70)

  return (
    <div className="page page-enter">
      <div className="section-head">
        <div>
          <h2 className="section-title">All <em>topics</em></h2>
          <p className="section-sub">PM chapters — your accuracy per area based on real mocks.</p>
        </div>
        <div style={{ position: 'relative' }}>
          <Icons.search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', pointerEvents: 'none' }}/>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search topics…"
            style={{ padding: '7px 12px 7px 32px', border: '1px solid var(--line)', borderRadius: 10, fontSize: 13, background: 'var(--surface)', color: 'var(--ink)', outline: 'none', width: 200 }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--ink-3)' }}>Loading topics…</div>
      ) : topics.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--ink-3)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📚</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 8 }}>No topics in the database yet</div>
          <div style={{ marginBottom: 20, fontSize: 13 }}>Add questions via the Admin panel to see topics here.</div>
          <button className="btn btn-primary" onClick={() => navigate('/admin')}>
            <Icons.plus size={13}/> Add questions
          </button>
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
            {[
              { label: 'Total topics', val: topics.length, color: 'var(--accent)' },
              { label: 'Attempted', val: attempted.length, color: 'var(--ink-2)' },
              { label: 'Need work', val: weak.length, color: 'var(--rose)' },
              { label: 'Strong', val: strong.length, color: 'var(--green)' },
            ].map(s => (
              <div key={s.label} style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, padding: '14px 18px' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--ink-3)' }}>No topics match "{search}"</div>
          ) : (
            <div className="topic-grid">
              {filtered.map(t => {
                const hasData = t.total > 0
                const isWeak = hasData && t.strength < 50
                const isMid = hasData && t.strength >= 50 && t.strength < 70
                const isStrong = hasData && t.strength >= 70
                const strengthVal = t.strength ?? 0

                return (
                  <div
                    key={t.num}
                    className={`topic-tile${isWeak ? ' weak' : ''}`}
                    onClick={() => navigate('/weak-areas', { state: { topic: t } })}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: isWeak ? 'rgba(244,63,118,.12)' : isMid ? 'rgba(245,179,59,.12)' : isStrong ? 'rgba(22,163,123,.12)' : 'var(--bg-2)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: isWeak ? 'var(--rose)' : isMid ? 'var(--gold)' : isStrong ? 'var(--green)' : 'var(--ink-3)' }}>{t.num}</span>
                      </div>
                      {hasData ? (
                        <span className={`tag ${isWeak ? 'weak' : isMid ? 'gold' : 'strong'}`}>{strengthVal}%</span>
                      ) : (
                        <span className="tag" style={{ opacity: .5 }}>Not tried</span>
                      )}
                    </div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', marginBottom: 10, lineHeight: 1.4 }}>{t.name}</div>
                    <div style={{ height: 4, borderRadius: 4, background: 'var(--line)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 4, width: strengthVal + '%',
                        background: isWeak ? 'var(--rose)' : isMid ? 'var(--gold)' : isStrong ? 'var(--green)' : 'var(--ink-3)',
                      }}/>
                    </div>
                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                        {!hasData ? 'No attempts yet' : isWeak ? 'Needs focus' : isMid ? 'Keep drilling' : 'Looking good'}
                        {hasData && ` · ${t.total} answered`}
                      </span>
                      <Icons.arrow size={12} style={{ color: 'var(--ink-3)' }}/>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
