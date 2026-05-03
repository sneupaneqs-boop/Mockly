import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { Icons } from '../components/Icons'
import PracticeCard from '../components/PracticeCard'
import { supabase } from '../lib/supabase'
import { useTopicPerformance, adaptDbQuestion } from '../lib/useTopicPerformance'

export default function WeakAreas() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const focusTopic = location.state?.topic || null

  const { topics, loading: topicsLoading } = useTopicPerformance(user?.id)
  const [allQuestions, setAllQuestions] = useState([])
  const [loadingQs, setLoadingQs] = useState(true)

  // Sorted weak topics (only those with attempts, or all if no attempts)
  const weakTopics = useMemo(() => {
    const attempted = topics.filter(t => t.total > 0)
    if (attempted.length > 0) {
      return [...attempted].sort((a, b) => (a.strength ?? 100) - (b.strength ?? 100)).slice(0, 8)
    }
    return topics.slice(0, 8)
  }, [topics])

  const [selectedTopic, setSelectedTopic] = useState(focusTopic)
  const [practiceIdx, setPracticeIdx] = useState(0)
  const [answered, setAnswered] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [sessionDone, setSessionDone] = useState(false)

  // Set default topic once weak topics load
  useEffect(() => {
    if (!selectedTopic && weakTopics.length > 0) {
      setSelectedTopic(weakTopics[0])
    }
  }, [weakTopics])

  // Fetch questions from DB
  useEffect(() => {
    supabase
      .from('questions')
      .select('id, subject, topic_number, topic_name, question_text, options, correct_answer, answer_type, explanation, exam_session')
      .eq('section', 'A')
      .limit(500)
      .then(({ data }) => {
        setAllQuestions((data || []).map(adaptDbQuestion))
        setLoadingQs(false)
      })
  }, [])

  const drillQuestions = useMemo(() => {
    if (!selectedTopic || allQuestions.length === 0) return allQuestions
    const byTopic = allQuestions.filter(q => q.topicNum === selectedTopic.num || q.topic === selectedTopic.name)
    return byTopic.length > 0 ? byTopic : allQuestions
  }, [selectedTopic, allQuestions])

  const q = drillQuestions[practiceIdx % Math.max(1, drillQuestions.length)]

  function handleAnswer({ correct }) {
    setAnswered(a => a + 1)
    if (correct) setCorrectCount(c => c + 1)
    if (answered + 1 >= drillQuestions.length) setSessionDone(true)
  }

  function nextQ() {
    const next = practiceIdx + 1
    if (next >= drillQuestions.length) setSessionDone(true)
    else setPracticeIdx(next)
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
  const isLoading = topicsLoading || loadingQs

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

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--ink-3)' }}>Loading…</div>
      ) : allQuestions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--ink-3)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📚</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 8 }}>No questions yet</div>
          <div style={{ marginBottom: 20, fontSize: 13 }}>Add Section A questions via the Admin panel to enable drilling.</div>
          <button className="btn btn-primary" onClick={() => navigate('/admin')}>
            <Icons.plus size={13}/> Add questions
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24 }}>
          {/* Topic picker */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 10 }}>
              {topics.filter(t => t.total > 0).length > 0 ? 'Your weak areas' : 'All topics'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {weakTopics.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--ink-3)', padding: '12px 0' }}>
                  Complete some mocks to see weak areas.
                </div>
              ) : weakTopics.map(t => (
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
                    background: t.total === 0 ? 'var(--ink-3)' : (t.strength ?? 100) < 50 ? 'var(--rose)' : (t.strength ?? 100) < 65 ? 'var(--gold)' : 'var(--green)',
                  }}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 1 }}>
                      {t.total > 0 ? `${t.strength}% accuracy · ${t.total} answered` : 'Not yet attempted'}
                    </div>
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
                {q && (
                  <PracticeCard
                    q={q}
                    idx={practiceIdx}
                    total={drillQuestions.length}
                    onNext={nextQ}
                    onAnswer={handleAnswer}
                  />
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
