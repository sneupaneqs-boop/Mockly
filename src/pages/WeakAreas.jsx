import React, { useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Icons } from '../components/Icons'
import PracticeCard from '../components/PracticeCard'
import { PRACTICE, TOPICS } from '../lib/mockData'

export default function WeakAreas() {
  const navigate = useNavigate()
  const location = useLocation()
  const focusTopic = location.state?.topic || null

  const weakTopics = useMemo(() =>
    [...TOPICS].sort((a, b) => a.strength - b.strength).slice(0, 8),
    []
  )

  const [selectedTopic, setSelectedTopic] = useState(focusTopic || weakTopics[0] || null)
  const [practiceIdx, setPracticeIdx] = useState(0)
  const [answered, setAnswered] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [sessionDone, setSessionDone] = useState(false)

  const drillQuestions = useMemo(() => {
    if (!selectedTopic) return PRACTICE
    const byTopic = PRACTICE.filter(q => q.topic === selectedTopic.name)
    return byTopic.length > 0 ? byTopic : PRACTICE
  }, [selectedTopic])

  const q = drillQuestions[practiceIdx % drillQuestions.length]

  function handleAnswer({ correct }) {
    setAnswered(a => a + 1)
    if (correct) setCorrectCount(c => c + 1)
    if (answered + 1 >= drillQuestions.length) setSessionDone(true)
  }

  function nextQ() {
    const next = practiceIdx + 1
    if (next >= drillQuestions.length) {
      setSessionDone(true)
    } else {
      setPracticeIdx(next)
    }
  }

  function restart() {
    setPracticeIdx(0)
    setAnswered(0)
    setCorrectCount(0)
    setSessionDone(false)
  }

  function selectTopic(t) {
    setSelectedTopic(t)
    setPracticeIdx(0)
    setAnswered(0)
    setCorrectCount(0)
    setSessionDone(false)
  }

  const accuracy = answered > 0 ? Math.round(correctCount / answered * 100) : 0

  return (
    <div className="page page-enter">
      <div className="section-head">
        <div>
          <h2 className="section-title">Weak area <em>drill</em></h2>
          <p className="section-sub">Focus on your lowest-scoring topics to climb your overall grade.</p>
        </div>
        <button className="btn btn-warm" onClick={() => navigate('/mock/create')}>
          <Icons.flask size={14}/> Full mock instead
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24 }}>
        {/* Topic picker */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 10 }}>Your weak areas</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {weakTopics.map(t => (
              <button
                key={t.num}
                onClick={() => selectTopic(t)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                  borderRadius: 12, border: '1px solid',
                  borderColor: selectedTopic?.num === t.num ? 'var(--accent)' : 'var(--line)',
                  background: selectedTopic?.num === t.num ? 'var(--accent-soft)' : 'var(--surface)',
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  background: t.strength < 50 ? 'var(--rose)' : t.strength < 65 ? 'var(--gold)' : 'var(--green)',
                }}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 1 }}>{t.strength}% accuracy</div>
                </div>
                {selectedTopic?.num === t.num && <Icons.arrow size={11} style={{ color: 'var(--accent)', flexShrink: 0 }}/>}
              </button>
            ))}
          </div>

          {/* Session stats */}
          {answered > 0 && (
            <div style={{ marginTop: 20, padding: 14, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--ink-3)', marginBottom: 10 }}>Session</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>Answered</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{answered}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>Correct</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)' }}>{correctCount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>Accuracy</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: accuracy >= 60 ? 'var(--green)' : accuracy >= 45 ? 'var(--gold)' : 'var(--rose)' }}>{accuracy}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Drill area */}
        <div>
          {sessionDone ? (
            <div className="card" style={{ textAlign: 'center', padding: 48 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>{accuracy >= 70 ? '🎉' : accuracy >= 50 ? '💪' : '📖'}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 8 }}>
                {accuracy >= 70 ? 'Great session!' : accuracy >= 50 ? 'Good effort!' : 'Keep practising!'}
              </div>
              <div style={{ color: 'var(--ink-3)', marginBottom: 8 }}>
                {correctCount} / {answered} correct — {accuracy}% accuracy
              </div>
              <div style={{ color: 'var(--ink-3)', fontSize: 13, marginBottom: 28 }}>
                on {selectedTopic?.name || 'mixed topics'}
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button className="btn btn-primary" onClick={restart}>
                  <Icons.bolt size={14}/> Drill again
                </button>
                <button className="btn btn-ghost" onClick={() => navigate('/mock/create')}>
                  <Icons.flask size={14}/> Full mock
                </button>
              </div>
            </div>
          ) : (
            <>
              {selectedTopic && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <span className="tag weak"><Icons.target size={11}/> Drilling: {selectedTopic.name}</span>
                  <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{drillQuestions.length} questions available</span>
                </div>
              )}
              <PracticeCard
                q={q}
                idx={practiceIdx}
                total={drillQuestions.length}
                onNext={nextQ}
                onAnswer={handleAnswer}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
