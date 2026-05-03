import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import { Icons } from '../components/Icons'
import PracticeCard from '../components/PracticeCard'
import { useTopicPerformance, calcStreak, adaptDbQuestion } from '../lib/useTopicPerformance'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [recentMocks, setRecentMocks] = useState([])
  const [loadingMocks, setLoadingMocks] = useState(true)
  const [practiceQuestions, setPracticeQuestions] = useState([])
  const [loadingPractice, setLoadingPractice] = useState(true)
  const [practiceIdx, setPracticeIdx] = useState(0)
  const [answered, setAnswered] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)

  const { topics, loading: topicsLoading } = useTopicPerformance(user?.id)

  // Fetch recent mocks
  useEffect(() => {
    if (!user) return
    supabase
      .from('mock_sessions')
      .select('id, subject, created_at, completed_at, score_a, score_b')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => {
        setRecentMocks(data || [])
        setLoadingMocks(false)
      })
  }, [user])

  // Fetch random practice questions from DB (shuffle fresh on each login)
  useEffect(() => {
    supabase
      .from('questions')
      .select('id, subject, topic_number, topic_name, question_text, options, correct_answer, answer_type, explanation, exam_session')
      .eq('section', 'A')
      .limit(200)
      .then(({ data }) => {
        if (!data || data.length === 0) { setLoadingPractice(false); return }
        // Fisher-Yates shuffle to get fresh order each session
        const arr = [...data]
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]]
        }
        setPracticeQuestions(arr.slice(0, 20).map(adaptDbQuestion))
        setLoadingPractice(false)
      })
  }, [])

  const stats = useMemo(() => {
    const completed = recentMocks.filter(m => m.completed_at)
    const avg = completed.length
      ? Math.round(completed.reduce((s, m) => s + ((m.score_a || 0) + (m.score_b || 0)), 0) / completed.length)
      : 0
    const streak = calcStreak(recentMocks)
    return { total: recentMocks.length, avg, streak }
  }, [recentMocks])

  const weakTopics = useMemo(() =>
    topics.filter(t => t.total > 0).sort((a, b) => (a.strength ?? 100) - (b.strength ?? 100)).slice(0, 2),
    [topics]
  )

  const displayName = user?.email?.split('@')[0] || 'there'

  const q = practiceQuestions[practiceIdx % Math.max(1, practiceQuestions.length)]

  function handleAnswer({ correct }) {
    setAnswered(a => a + 1)
    if (correct) setCorrectCount(c => c + 1)
  }

  function nextPractice() {
    setPracticeIdx(i => (i + 1) % Math.max(1, practiceQuestions.length))
  }

  return (
    <div className="page page-enter">
      {/* Hero */}
      <div className="hero">
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--accent-2)', marginBottom: 14 }}>
            <Icons.sparkle size={12}/> Welcome back, {displayName}
          </div>
          <h1>Sharpen <em>PM</em> in<br/>20 questions a day.</h1>
          <p>
            {weakTopics[0]
              ? `${weakTopics[0].name} is your weakest area at ${weakTopics[0].strength}% accuracy. Keep drilling to pass.`
              : 'Build your confidence one mock at a time.'}
          </p>
          <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
            <button className="btn btn-warm" onClick={() => navigate('/mock/create')}>
              <Icons.bolt size={14}/> Start full mock
            </button>
            <button className="btn btn-ghost" onClick={() => navigate('/weak-areas')}>
              <Icons.target size={14}/> Drill weak area
            </button>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <b>{stats.streak}<span style={{ fontSize: 14, opacity: .5 }}>d</span></b>
              <span>Streak</span>
            </div>
            <div className="hero-stat">
              <b>{stats.avg || '--'}<span style={{ fontSize: 14, opacity: .5 }}>{stats.avg ? '%' : ''}</span></b>
              <span>Avg score</span>
            </div>
            <div className="hero-stat">
              <b>{stats.total}</b>
              <span>Mocks taken</span>
            </div>
          </div>
        </div>

        <div className="hero-illust">
          <div className="float-card c1">
            <div style={{ fontSize: 10, opacity: .6, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>Activity-based costing</div>
            <div style={{ fontSize: 11, marginBottom: 6 }}>Set-up cost driver rate?</div>
            <div className="row"><span className="opt">A · $6,000</span></div>
            <div className="row"><span className="opt correct">B · $15,000 ✓</span></div>
          </div>
          <div className="badge-streak"><Icons.flame size={12}/> +5 XP</div>
          <div className="float-card c2">
            <div style={{ fontSize: 10, opacity: .6, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>Break-even</div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 11 }}>
              <span>BEP =</span>
              <span style={{ fontFamily: 'var(--font-mono)', padding: '2px 6px', background: 'rgba(34,211,238,.18)', borderRadius: 4 }}>FC / CM</span>
              <span>= 6,000u</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="quick-grid">
        <div className="quick q1" onClick={() => navigate('/mock/create')}>
          <Icons.arrow size={14} className="arrow"/>
          <div className="qicon"><Icons.flask size={20}/></div>
          <b>Build a mock</b>
          <span>Section A · B · C. Auto-graded with instant results.</span>
        </div>
        <div className="quick q2" onClick={() => navigate('/weak-areas')}>
          <Icons.arrow size={14} className="arrow"/>
          <div className="qicon"><Icons.target size={20}/></div>
          <b>Drill weak area</b>
          <span>{weakTopics[0]?.name || 'Pick your weakest topic to drill.'}</span>
        </div>
        <div className="quick q3" onClick={() => navigate('/history')}>
          <Icons.arrow size={14} className="arrow"/>
          <div className="qicon"><Icons.history size={20}/></div>
          <b>Review history</b>
          <span>{stats.total > 0 ? `${stats.total} past mocks · find patterns & trends.` : 'No mocks yet — start your first one.'}</span>
        </div>
        <div className="quick q4" onClick={() => navigate('/topics')}>
          <Icons.arrow size={14} className="arrow"/>
          <div className="qicon"><Icons.book size={20}/></div>
          <b>Browse topics</b>
          <span>All PM chapters · track your strength per area.</span>
        </div>
      </div>

      {/* Practice questions */}
      <div className="section-head">
        <div>
          <h2 className="section-title">Quick <em>practice</em></h2>
          <p className="section-sub">New questions every session · instant feedback &amp; explanation.</p>
        </div>
        {practiceQuestions.length > 0 && (
          <div style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>
            Today: <b style={{ color: 'var(--ink)' }}>{correctCount}</b> / {answered} correct
          </div>
        )}
      </div>

      {loadingPractice ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-3)' }}>Loading questions…</div>
      ) : practiceQuestions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--ink-3)' }}>
          <div style={{ fontSize: 28, marginBottom: 12 }}>📚</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 8 }}>No practice questions yet</div>
          <div style={{ marginBottom: 20, fontSize: 13 }}>Add Section A questions in the Admin panel to enable quick practice.</div>
          <button className="btn btn-sm" onClick={() => navigate('/admin')}>
            <Icons.plus size={13}/> Go to Admin
          </button>
        </div>
      ) : (
        <PracticeCard
          q={q}
          idx={practiceIdx}
          total={practiceQuestions.length}
          onNext={nextPractice}
          onAnswer={handleAnswer}
        />
      )}

      {/* Recent mocks */}
      {!loadingMocks && recentMocks.length > 0 && (
        <>
          <div className="section-head" style={{ marginTop: 36 }}>
            <div>
              <h2 className="section-title">Recent <em>mocks</em></h2>
              <p className="section-sub">Your last {recentMocks.length} sessions</p>
            </div>
            <button className="btn btn-sm" onClick={() => navigate('/history')}>
              View all <Icons.arrow size={12}/>
            </button>
          </div>
          <div className="mock-list">
            {recentMocks.slice(0, 4).map(m => {
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
                    <div className="sub">{m.subject} · {new Date(m.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                  </div>
                  <span className="time">
                    <Icons.clock size={11}/> {m.completed_at ? 'Complete' : 'In progress'}
                  </span>
                  <div className="pct">
                    {m.completed_at ? score : '—'}
                  </div>
                  <button className="btn btn-sm">
                    {m.completed_at ? 'Review' : 'Continue'} <Icons.arrow size={12}/>
                  </button>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
