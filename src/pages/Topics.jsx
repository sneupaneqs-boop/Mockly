import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icons } from '../components/Icons'
import { TOPICS } from '../lib/mockData'

export default function Topics() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const filtered = TOPICS.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  )

  const grouped = {
    weak: filtered.filter(t => t.strength < 50),
    mid: filtered.filter(t => t.strength >= 50 && t.strength < 70),
    strong: filtered.filter(t => t.strength >= 70),
  }

  return (
    <div className="page page-enter">
      <div className="section-head">
        <div>
          <h2 className="section-title">All <em>topics</em></h2>
          <p className="section-sub">18 PM chapters · your strength per area.</p>
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

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Total topics', val: TOPICS.length, color: 'var(--accent)' },
          { label: 'Need work', val: grouped.weak.length, color: 'var(--rose)' },
          { label: 'Improving', val: grouped.mid.length, color: 'var(--gold)' },
          { label: 'Strong', val: grouped.strong.length, color: 'var(--green)' },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Topic grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--ink-3)' }}>No topics match "{search}"</div>
      ) : (
        <div className="topic-grid">
          {filtered.map(t => {
            const isWeak = t.strength < 50
            const isMid = t.strength >= 50 && t.strength < 70
            return (
              <div
                key={t.num}
                className={`topic-tile${isWeak ? ' weak' : ''}`}
                onClick={() => navigate('/weak-areas', { state: { topic: t } })}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: isWeak ? 'rgba(244,63,118,.12)' : isMid ? 'rgba(245,179,59,.12)' : 'rgba(22,163,123,.12)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: isWeak ? 'var(--rose)' : isMid ? 'var(--gold)' : 'var(--green)' }}>{t.num}</span>
                  </div>
                  <span className={`tag ${isWeak ? 'weak' : isMid ? 'gold' : 'strong'}`}>
                    {t.strength}%
                  </span>
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', marginBottom: 10, lineHeight: 1.4 }}>{t.name}</div>
                <div style={{ height: 4, borderRadius: 4, background: 'var(--line)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 4,
                    width: t.strength + '%',
                    background: isWeak ? 'var(--rose)' : isMid ? 'var(--gold)' : 'var(--green)',
                    transition: 'width .4s ease'
                  }}/>
                </div>
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                    {isWeak ? 'Needs focus' : isMid ? 'Keep drilling' : 'Looking good'}
                  </span>
                  <Icons.arrow size={12} style={{ color: 'var(--ink-3)' }}/>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
