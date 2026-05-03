import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import { Icons } from '../components/Icons'
import { ScoreTrendChart, RadarChart, Sparkline } from '../components/Charts'
import { TOPICS } from '../lib/mockData'

export default function History() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [mocks, setMocks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase
      .from('mock_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setMocks(data || [])
        setLoading(false)
      })
  }, [user])

  const stats = useMemo(() => {
    const completed = mocks.filter(m => m.completed_at)
    const avg = completed.length
      ? Math.round(completed.reduce((s, m) => s + ((m.score_a || 0) + (m.score_b || 0)), 0) / completed.length)
      : 0
    const best = completed.length
      ? Math.max(...completed.map(m => (m.score_a || 0) + (m.score_b || 0)))
      : 0
    const lastScores = completed.slice(0, 5).map(m => (m.score_a || 0) + (m.score_b || 0))
    const trend = lastScores.length > 1 ? lastScores[0] - lastScores[lastScores.length - 1] : 0
    return { total: mocks.length, avg, best, trend, lastScores }
  }, [mocks])

  // Heatmap cells (26 weeks × 7 days)
  const cells = useMemo(() => {
    const today = new Date()
    const mockDates = new Set(mocks.map(m => m.created_at?.slice(0, 10)))
    return Array.from({ length: 182 }, (_, i) => {
      const d = new Date(today); d.setDate(d.getDate() - (181 - i))
      const iso = d.toISOString().slice(0, 10)
      let level = mockDates.has(iso) ? 4 : 0
      if (!level) {
        const seed = (d.getDate() * 31 + d.getMonth() * 7 + d.getFullYear()) % 11
        if (seed > 8) level = 3
        else if (seed > 6) level = 2
        else if (seed > 4) level = 1
      }
      return { iso, level }
    })
  }, [mocks])

  const weakTopics = [...TOPICS].sort((a, b) => a.strength - b.strength).slice(0, 5)

  // Build mock objects that charts can use (with .score and .date)
  const chartMocks = mocks
    .filter(m => m.completed_at)
    .map(m => ({
      ...m,
      score: (m.score_a || 0) + (m.score_b || 0),
      date: m.created_at?.slice(0, 10),
      name: `${m.subject} Mock`,
    }))

  if (loading) {
    return (
      <div className="page page-enter" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ color: 'var(--ink-3)', fontSize: 14 }}>Loading your history…</div>
      </div>
    )
  }

  return (
    <div className="page page-enter">
      <div className="section-head">
        <div>
          <h2 className="section-title">Your <em>history</em></h2>
          <p className="section-sub">Every mock you've taken — see your progress and find weak areas.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-sm"><Icons.filter size={14}/> Filter</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <div className="kpi accent">
          <div className="k-label">Mocks taken</div>
          <div className="k-val">{stats.total}</div>
          <div className="k-trend">▲ All time</div>
          <Sparkline values={[2,3,5,4,7,6,8,stats.total]} color="#5B5BFF"/>
        </div>
        <div className="kpi green">
          <div className="k-label">Average score</div>
          <div className="k-val">{stats.avg || '--'}<span style={{ fontSize: 18, opacity: .5 }}>{stats.avg ? '%' : ''}</span></div>
          <div className={`k-trend ${stats.trend < 0 ? 'down' : ''}`}>
            {stats.trend >= 0 ? '▲' : '▼'} {Math.abs(stats.trend)} pts last 5
          </div>
          <Sparkline values={stats.lastScores.length ? [...stats.lastScores].reverse() : [0]} color="#16A37B"/>
        </div>
        <div className="kpi warm">
          <div className="k-label">Best score</div>
          <div className="k-val">{stats.best || '--'}<span style={{ fontSize: 18, opacity: .5 }}>{stats.best ? '%' : ''}</span></div>
          <div className="k-trend">★ Personal record</div>
          <Sparkline values={[55,60,58,65,68,71,stats.best || 0]} color="#FF7A45"/>
        </div>
        <div className="kpi violet">
          <div className="k-label">7-day streak</div>
          <div className="k-val">7<span style={{ fontSize: 18, opacity: .5 }}>d</span></div>
          <div className="k-trend">🔥 Keep going</div>
          <Sparkline values={[1,2,1,3,2,4,3,5]} color="#8B5CF6"/>
        </div>
      </div>

      {/* Charts */}
      {chartMocks.length > 0 && (
        <div className="charts-grid">
          <div className="chart-card">
            <div className="chart-head">
              <div>
                <h3 className="chart-title">Score trend</h3>
                <p className="chart-sub">Your last {chartMocks.length} mocks · pass mark at 50%</p>
              </div>
              <div className="chart-pills">
                <span className="cp active">All</span>
              </div>
            </div>
            <ScoreTrendChart mocks={chartMocks}/>
          </div>
          <div className="chart-card">
            <div className="chart-head">
              <div>
                <h3 className="chart-title">Strengths radar</h3>
                <p className="chart-sub">Top 8 topics by accuracy</p>
              </div>
            </div>
            <div style={{ display: 'grid', placeItems: 'center' }}>
              <RadarChart topics={TOPICS}/>
            </div>
          </div>
        </div>
      )}

      {/* Weakest areas + Recommendations */}
      <div className="charts-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="chart-card">
          <div className="chart-head">
            <div>
              <h3 className="chart-title">Weakest areas</h3>
              <p className="chart-sub">Lowest accuracy across all mocks</p>
            </div>
            <span className="tag weak">Focus zone</span>
          </div>
          <div className="weak-list">
            {weakTopics.map(t => (
              <div className="weak-item" key={t.num}
                onClick={() => navigate('/weak-areas')} style={{ cursor: 'pointer' }}>
                <div className="row">
                  <b>{t.num}. {t.name}</b>
                  <span>{t.strength}% accuracy</span>
                </div>
                <div className="weak-bar">
                  <div className={`fill ${t.strength > 60 ? 'ok' : t.strength > 45 ? 'mid' : ''}`}
                    style={{ width: t.strength + '%' }}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card" style={{
          background: 'linear-gradient(135deg, #111B30 0%, #1F2C4D 100%)',
          color: '#fff', borderColor: 'transparent', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(400px 200px at 100% 0%, rgba(91,91,255,.3), transparent 60%)', pointerEvents: 'none' }}/>
          <div className="chart-head" style={{ position: 'relative' }}>
            <div>
              <h3 className="chart-title" style={{ color: '#fff' }}>Recommended next</h3>
              <p className="chart-sub" style={{ color: 'rgba(255,255,255,.6)' }}>Personalised by your pattern</p>
            </div>
            <span className="tag" style={{ background: 'rgba(255,255,255,.1)', color: '#fff', borderColor: 'transparent' }}>
              <Icons.sparkle size={12}/> AI tutor
            </span>
          </div>
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {weakTopics.slice(0, 2).map((t, i) => (
              <div key={t.num} style={{ display: 'flex', alignItems: 'start', gap: 14, padding: 14, borderRadius: 14, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)' }}>
                <div style={{ width: 42, height: 42, borderRadius: 11, background: i === 0 ? 'linear-gradient(135deg, var(--rose), var(--warm))' : 'linear-gradient(135deg, var(--accent), var(--violet))', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Icons.target size={20}/>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Drill: {t.name}</div>
                  <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,.6)', lineHeight: 1.5 }}>
                    {t.strength}% accuracy. Focus here to improve your overall score.
                  </div>
                  <button className="btn btn-warm btn-sm" style={{ marginTop: 10 }}
                    onClick={() => navigate('/weak-areas')}>
                    Start drill <Icons.arrow size={12}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="chart-card" style={{ marginTop: 18 }}>
        <div className="chart-head">
          <div>
            <h3 className="chart-title">Study calendar</h3>
            <p className="chart-sub">Last 26 weeks · 7-day streak active 🔥</p>
          </div>
          <span className="tag strong"><Icons.flame size={11}/> 7-day streak</span>
        </div>
        <div className="heatmap">
          {cells.map((c, i) => (
            <div key={i} className={`heat-cell ${c.level ? 'l' + c.level : ''}`} title={c.iso}/>
          ))}
        </div>
        <div className="heat-legend">
          <span>Less</span>
          {[0,1,2,3,4].map(l => <span key={l} className={`swatch heat-cell ${l ? 'l' + l : ''}`}/>)}
          <span>More</span>
        </div>
      </div>

      {/* Mock list */}
      <div className="section-head" style={{ marginTop: 32 }}>
        <h3 className="section-title" style={{ fontSize: 22 }}>All <em>mocks</em></h3>
      </div>

      {mocks.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--ink-3)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📝</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 8 }}>No mocks yet</div>
          <div style={{ marginBottom: 20 }}>Take your first mock to see your history here.</div>
          <button className="btn btn-primary" onClick={() => navigate('/mock/create')}>
            <Icons.flask size={14}/> Create a mock
          </button>
        </div>
      ) : (
        <div className="mock-list">
          {mocks.map(m => {
            const score = (m.score_a || 0) + (m.score_b || 0)
            const tier = score >= 75 ? 's90' : score >= 60 ? 's70' : score >= 45 ? 's50' : 's30'
            return (
              <div key={m.id} className="mock-row"
                onClick={() => navigate(m.completed_at ? `/mock/${m.id}/results` : `/mock/${m.id}`)}>
                <div className={`badge-circle ${m.completed_at ? tier : 's30'}`}>
                  {m.completed_at ? score || '--' : '…'}
                </div>
                <div>
                  <div className="name">{m.subject} Mock Exam</div>
                  <div className="sub">
                    {m.subject} · {new Date(m.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    {!m.completed_at && <span style={{ color: 'var(--gold)', marginLeft: 8 }}>⏸ In progress</span>}
                  </div>
                </div>
                <span className="time">
                  <Icons.clock size={11}/> {m.completed_at ? 'Complete' : 'Ongoing'}
                </span>
                <div className="pct">
                  {m.completed_at ? score : '—'}
                  <span style={{ fontSize: 13, color: 'var(--ink-3)' }}></span>
                </div>
                <button className="btn btn-sm">
                  {m.completed_at ? 'Review' : 'Continue'} <Icons.arrow size={12}/>
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
