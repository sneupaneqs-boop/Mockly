import React from 'react'
import { Icons } from '../components/Icons'
import { LEADERBOARD } from '../lib/mockData'
import { useAuth } from '../lib/AuthContext'

const MEDALS = ['🥇', '🥈', '🥉']

export default function Leaderboard() {
  const { user } = useAuth()
  const displayName = user?.email?.split('@')[0] || 'you'

  const myEntry = {
    name: displayName,
    score: 68,
    mocks: 3,
    color: '#5B5BFF',
    isMe: true,
  }

  const entries = [...LEADERBOARD, myEntry]
    .sort((a, b) => b.score - a.score)
    .map((e, i) => ({ ...e, rank: i + 1 }))

  const myRank = entries.find(e => e.isMe)?.rank || entries.length

  return (
    <div className="page page-enter">
      <div className="section-head">
        <div>
          <h2 className="section-title">Leader<em>board</em></h2>
          <p className="section-sub">Top performers this month · keep drilling to climb the ranks.</p>
        </div>
        <span className="tag strong"><Icons.trophy size={12}/> Monthly</span>
      </div>

      {/* My rank banner */}
      <div style={{
        background: 'linear-gradient(135deg, #111B30 0%, #1F2C4D 100%)',
        borderRadius: 18, padding: '20px 24px', marginBottom: 28,
        display: 'flex', alignItems: 'center', gap: 20, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(400px 200px at 0% 50%, rgba(91,91,255,.25), transparent 60%)', pointerEvents: 'none' }}/>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, var(--accent), var(--violet))', display: 'grid', placeItems: 'center', fontSize: 22, fontWeight: 800, color: '#fff', flexShrink: 0, position: 'relative' }}>
          #{myRank}
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>Your ranking</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: '#fff', marginBottom: 4 }}>
            You're ranked <em>#{myRank}</em> this month
          </div>
          <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,.6)' }}>
            {myRank > 1
              ? `${entries[myRank - 2]?.score - myEntry.score} pts behind ${entries[myRank - 2]?.name} · keep going!`
              : "You're at the top — defend your crown!"}
          </div>
        </div>
        <div style={{ textAlign: 'right', position: 'relative' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{myEntry.score}<span style={{ fontSize: 16, opacity: .5 }}>%</span></div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>{myEntry.mocks} mocks</div>
        </div>
      </div>

      {/* Podium top 3 */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 12, marginBottom: 32, padding: '0 60px' }}>
        {[entries[1], entries[0], entries[2]].filter(Boolean).map((e, i) => {
          const heights = [100, 130, 80]
          const realRank = i === 0 ? 2 : i === 1 ? 1 : 3
          return (
            <div key={e.name} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: realRank === 1 ? 28 : 22 }}>{MEDALS[realRank - 1]}</div>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: e.color, display: 'grid', placeItems: 'center', fontSize: 16, fontWeight: 700, color: '#fff', boxShadow: `0 4px 16px ${e.color}55` }}>
                {e.name[0].toUpperCase()}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{e.isMe ? 'You' : e.name}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{e.score}%</div>
              <div style={{
                width: '100%', borderRadius: '10px 10px 0 0',
                height: heights[i], minHeight: heights[i],
                background: realRank === 1 ? 'linear-gradient(to top, var(--gold), #FDE68A)' :
                  realRank === 2 ? 'linear-gradient(to top, #94A3B8, #CBD5E1)' : 'linear-gradient(to top, #CD7C46, #D4935F)',
                display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 10,
              }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: realRank === 1 ? '#92400E' : realRank === 2 ? '#475569' : '#7C3009' }}>#{realRank}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Full leaderboard */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {entries.map((e, i) => (
          <div key={e.name + i} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 18px', borderRadius: 14,
            background: e.isMe ? 'var(--accent-soft)' : 'var(--surface)',
            border: `1px solid ${e.isMe ? 'var(--accent)' : 'var(--line)'}`,
          }}>
            <div style={{ width: 28, textAlign: 'center', fontSize: 16, flexShrink: 0 }}>
              {i < 3 ? MEDALS[i] : <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-3)' }}>#{e.rank}</span>}
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: e.color, display: 'grid', placeItems: 'center', fontSize: 15, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {e.name[0].toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>
                {e.isMe ? `${e.name} (you)` : e.name}
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 1 }}>{e.mocks} mocks completed</div>
            </div>
            <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: e.isMe ? 'var(--accent)' : 'var(--ink)' }}>{e.score}<span style={{ fontSize: 12, opacity: .5 }}>%</span></div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>avg score</div>
              </div>
              <div style={{ width: 80 }}>
                <div style={{ height: 4, borderRadius: 4, background: 'var(--line)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 4, width: e.score + '%', background: e.color }}/>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--ink-3)', marginTop: 24 }}>
        Leaderboard refreshes monthly · scores are based on completed mock average
      </p>
    </div>
  )
}
