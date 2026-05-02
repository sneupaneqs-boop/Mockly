import React, { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { normalizeQuestion, markAnswer, requiresSpreadsheet } from '../lib/questionUtils'

function parseMaxMarks(requirement) {
  const m = (requirement || '').match(/\((\d+)\s*marks?\)/i)
  return m ? parseInt(m[1]) : null
}

function ScoreBadge({ label, score, max, color }) {
  const pct = max ? Math.round(score / max * 100) : 0
  return (
    <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 4, padding: '12px 20px', textAlign: 'center', minWidth: 120 }}>
      <div style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{score}<span style={{ fontSize: 16, fontWeight: 400, color: 'rgba(255,255,255,0.7)' }}>/{max}</span></div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{label}</div>
      <div style={{ marginTop: 6, height: 4, background: 'rgba(0,0,0,0.2)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: pct >= 50 ? '#2ecc71' : '#e74c3c', transition: 'width 0.6s' }} />
      </div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 3 }}>{pct}%</div>
    </div>
  )
}

function QuestionResultCard({ item, qNum }) {
  const q = useMemo(() => normalizeQuestion(item.questionData), [item.questionData])
  const [expanded, setExpanded] = useState(false)

  if (!q) return null

  const { correct, marks } = markAnswer(q, item.user_answer)
  const isTextType = correct === null
  const isCorrect = correct === true

  let statusBg, statusColor, statusText
  if (isTextType) { statusBg = '#fff8e0'; statusColor = '#a06000'; statusText = 'Self-mark' }
  else if (isCorrect) { statusBg = '#eafaf1'; statusColor = '#1a7a45'; statusText = `✓ +2` }
  else { statusBg = '#fef0ee'; statusColor = '#b83030'; statusText = `✗ 0` }

  return (
    <div style={{ border: `1px solid ${isTextType ? '#f5d060' : isCorrect ? '#9de0b8' : '#f4a9a0'}`, borderRadius: 4, marginBottom: 10, overflow: 'hidden', background: '#fff' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '10px 14px', background: isTextType ? '#fffbf0' : isCorrect ? '#f4fbf7' : '#fff9f8' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontWeight: 700, fontSize: 12, color: '#1a2b4a' }}>Q{qNum}</span>
            {q.answer_type && <span style={{ fontSize: 10, color: '#7a9cbd', textTransform: 'uppercase', fontWeight: 600 }}>{q.answer_type}</span>}
            {q.exam_session && <span style={{ fontSize: 10, color: '#9ab3cc' }}>{q.exam_session}</span>}
          </div>
          {q.scenario && (
            <div style={{ fontSize: 11, color: '#5a7a9a', background: '#f0f4f8', padding: '4px 8px', marginBottom: 6, borderRadius: 2, lineHeight: 1.5, maxHeight: 48, overflow: 'hidden' }}>
              {q.scenario.substring(0, 160)}…
            </div>
          )}
          <p style={{ fontSize: 13, color: '#222', lineHeight: 1.55, margin: 0 }}>{q.question_text}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 16, flexShrink: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 700, padding: '3px 10px', borderRadius: 2, background: statusBg, color: statusColor }}>{statusText}</span>
          <button
            onClick={() => setExpanded(e => !e)}
            style={{ fontSize: 11, color: '#0f4c81', background: '#e8f0f8', border: 'none', padding: '3px 10px', cursor: 'pointer', borderRadius: 2 }}
          >
            {expanded ? 'Hide' : 'Explain'}
          </button>
        </div>
      </div>

      {/* Answer comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, borderTop: `1px solid ${isCorrect ? '#9de0b8' : isTextType ? '#f5d060' : '#f4a9a0'}` }}>
        <div style={{ padding: '8px 14px', borderRight: '1px solid #e8eff5' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#7a9cbd', textTransform: 'uppercase', marginBottom: 4 }}>Your Answer</div>
          <div style={{ fontSize: 13, padding: '4px 8px', background: isTextType ? '#fff8e0' : isCorrect ? '#eafaf1' : '#fef0ee', borderRadius: 2, color: isCorrect ? '#1a7a45' : '#b83030', fontWeight: 600 }}>
            {item.user_answer || <span style={{ color: '#bbb', fontStyle: 'italic', fontWeight: 400 }}>No answer</span>}
          </div>
        </div>
        <div style={{ padding: '8px 14px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#7a9cbd', textTransform: 'uppercase', marginBottom: 4 }}>Correct Answer</div>
          <div style={{ fontSize: 13, padding: '4px 8px', background: '#eafaf1', borderRadius: 2, color: '#1a7a45', fontWeight: 600 }}>
            {q.correct_answer || <span style={{ color: '#bbb', fontStyle: 'italic', fontWeight: 400 }}>—</span>}
          </div>
        </div>
      </div>

      {/* Options display */}
      {q.options && expanded && (
        <div style={{ padding: '8px 14px', borderTop: '1px solid #e8eff5', background: '#fafcff' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#7a9cbd', textTransform: 'uppercase', marginBottom: 6 }}>Options</div>
          {Object.entries(q.options).map(([k, v]) => {
            const correctLetters = (q.correct_answer || '').split(',').map(s => s.trim().toUpperCase())
            const isCorrectOpt = correctLetters.includes(k)
            const isUserOpt = (item.user_answer || '').split(',').map(s => s.trim().toUpperCase()).includes(k)
            return (
              <div key={k} style={{ display: 'flex', gap: 8, marginBottom: 3, padding: '3px 6px', borderRadius: 2, background: isCorrectOpt ? '#eafaf1' : isUserOpt && !isCorrectOpt ? '#fef0ee' : 'transparent' }}>
                <span style={{ fontWeight: 700, fontSize: 12, color: isCorrectOpt ? '#1a7a45' : isUserOpt ? '#b83030' : '#0f4c81', minWidth: 18 }}>{k}.</span>
                <span style={{ fontSize: 12, color: '#333', lineHeight: 1.5 }}>{v}</span>
                {isCorrectOpt && <span style={{ fontSize: 10, color: '#1a7a45', fontWeight: 700, marginLeft: 'auto' }}>✓ Correct</span>}
              </div>
            )
          })}
        </div>
      )}

      {/* Explanation */}
      {expanded && q.explanation && (
        <div style={{ padding: '10px 14px', borderTop: '1px solid #e8eff5', background: '#f8fafc' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#0f4c81', textTransform: 'uppercase', marginBottom: 6 }}>Explanation</div>
          <div style={{ fontSize: 12, color: '#333', lineHeight: 1.65, whiteSpace: 'pre-wrap', fontFamily: 'Arial, sans-serif' }}>
            {q.explanation}
          </div>
        </div>
      )}
    </div>
  )
}

export default function MockResults() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [session, setSession] = useState(null)
  const [items, setItems] = useState([])
  const [tab, setTab] = useState('A')
  const [selfMarks, setSelfMarks] = useState({}) // `${mockQId}_${partIdx}` → marks string
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: sess } = await supabase.from('mock_sessions').select('*').eq('id', id).single()
      setSession(sess)
      const { data: mqs } = await supabase.from('mock_questions').select('*').eq('mock_id', id).order('display_order')

      const abIds = (mqs || []).filter(q => q.question_table === 'questions').map(q => q.question_id)
      const cIds  = (mqs || []).filter(q => q.question_table === 'section_c').map(q => q.question_id)

      const qMap = {}
      if (abIds.length > 0) {
        const { data } = await supabase.from('questions').select('*').in('id', abIds)
        for (const q of data || []) qMap[q.id] = q
      }
      if (cIds.length > 0) {
        const { data } = await supabase.from('section_c').select('*').in('id', cIds)
        for (const q of data || []) qMap[q.id] = { ...q, section: 'C' }
      }

      const enriched = (mqs || []).map(mq => ({ ...mq, questionData: qMap[mq.question_id] || null }))
      setItems(enriched)

      // Compute scores and save
      const sectionItems = { A: enriched.filter(i => i.section === 'A'), B: enriched.filter(i => i.section === 'B') }
      let scoreA = 0, scoreB = 0
      for (const item of sectionItems.A) {
        const q = normalizeQuestion(item.questionData)
        if (q) scoreA += markAnswer(q, item.user_answer).marks || 0
      }
      for (const item of sectionItems.B) {
        const q = normalizeQuestion(item.questionData)
        if (q) scoreB += markAnswer(q, item.user_answer).marks || 0
      }
      await supabase.from('mock_sessions').update({ score_a: scoreA, score_b: scoreB }).eq('id', id)

      setLoading(false)

      // Set default tab to first available section
      const firstSection = enriched[0]?.section || 'A'
      setTab(firstSection)
    }
    load()
  }, [id])

  const bySection = useMemo(() => ({
    A: items.filter(i => i.section === 'A'),
    B: items.filter(i => i.section === 'B'),
    C: items.filter(i => i.section === 'C'),
  }), [items])

  const scoreA = useMemo(() =>
    bySection.A.reduce((s, item) => s + (markAnswer(normalizeQuestion(item.questionData), item.user_answer).marks || 0), 0),
    [bySection.A])

  const scoreB = useMemo(() =>
    bySection.B.reduce((s, item) => s + (markAnswer(normalizeQuestion(item.questionData), item.user_answer).marks || 0), 0),
    [bySection.B])

  const cSelfTotal = useMemo(() =>
    Object.values(selfMarks).reduce((s, v) => s + (parseInt(v) || 0), 0),
    [selfMarks])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#5a7a9a', fontSize: 14, fontFamily: 'Arial' }}>
        Calculating results…
      </div>
    )
  }

  const tabs = ['A', 'B', 'C'].filter(s => bySection[s].length > 0)
  const totalMarks = scoreA + scoreB + cSelfTotal
  const maxMarks = bySection.A.length * 2 + bySection.B.length * 2

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', fontFamily: 'Arial, Helvetica, sans-serif' }}>
      {/* Top bar */}
      <div style={{ background: '#1a2b4a', padding: '0 20px', height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Mockly</span>
          <span style={{ color: '#7a9cbd' }}>|</span>
          <span style={{ color: '#c8d8e8', fontSize: 13 }}>Results — {session?.subject} Mock Exam</span>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          style={{ color: '#c8d8e8', background: 'none', border: '1px solid rgba(255,255,255,0.3)', padding: '4px 14px', cursor: 'pointer', fontSize: 12, borderRadius: 2 }}
        >
          ← Dashboard
        </button>
      </div>

      {/* Score banner */}
      <div style={{ background: '#0f4c81', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        {bySection.A.length > 0 && <ScoreBadge label="Section A — MCQ" score={scoreA} max={bySection.A.length * 2} />}
        {bySection.B.length > 0 && <ScoreBadge label="Section B — MTQ" score={scoreB} max={bySection.B.length * 2} />}
        {bySection.C.length > 0 && <ScoreBadge label="Section C (Self)" score={cSelfTotal} max={40} />}
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Auto-marked Total</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>{scoreA + scoreB}/{bySection.A.length * 2 + bySection.B.length * 2}</div>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '20px 16px' }}>
        {/* Section tabs */}
        <div style={{ display: 'flex', borderBottom: '2px solid #d0d9e4', marginBottom: 20 }}>
          {tabs.map(s => (
            <button
              key={s}
              onClick={() => setTab(s)}
              style={{
                padding: '8px 20px', fontSize: 13, fontWeight: tab === s ? 700 : 500,
                color: tab === s ? '#0f4c81' : '#5a7a9a',
                borderBottom: tab === s ? '2px solid #0f4c81' : '2px solid transparent',
                background: 'none', border: 'none', cursor: 'pointer',
                marginBottom: -2, transition: 'all 0.15s',
              }}
            >
              Section {s}
              {s === 'A' && ` — ${scoreA}/${bySection.A.length * 2}`}
              {s === 'B' && ` — ${scoreB}/${bySection.B.length * 2}`}
              {s === 'C' && ` — ${cSelfTotal} (self)`}
            </button>
          ))}
        </div>

        {/* Section A & B */}
        {(tab === 'A' || tab === 'B') && (
          <div>
            {bySection[tab].map((item, idx) => (
              <QuestionResultCard key={item.id} item={item} qNum={idx + 1} />
            ))}
          </div>
        )}

        {/* Section C */}
        {tab === 'C' && (
          <div>
            {bySection.C.map((item, qIdx) => {
              const q = item.questionData
              if (!q) return null
              const parts = q.parts || []
              let parsedAnswer = {}
              try { parsedAnswer = item.user_answer ? JSON.parse(item.user_answer) : {} } catch {}

              return (
                <div key={item.id} style={{ background: '#fff', border: '1px solid #d0d9e4', borderRadius: 4, marginBottom: 20, overflow: 'hidden' }}>
                  {/* Header */}
                  <div style={{ padding: '12px 16px', background: '#f0f6ff', borderBottom: '1px solid #d0d9e4' }}>
                    <div style={{ fontSize: 11, color: '#7a9cbd', marginBottom: 4 }}>{q.topic_name} | {q.exam_session}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1a2b4a' }}>Question C{qIdx + 1}</div>
                  </div>

                  {/* Scenario */}
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #e8eff5', background: '#fafcff', maxHeight: 200, overflowY: 'auto' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#0f4c81', textTransform: 'uppercase', marginBottom: 6 }}>Scenario</div>
                    <div style={{ fontSize: 12, color: '#333', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{q.scenario}</div>
                  </div>

                  {/* Parts */}
                  {parts.map((p, pIdx) => {
                    const key = `${item.id}_${pIdx}`
                    const maxM = parseMaxMarks(p.requirement)
                    const needsSheet = requiresSpreadsheet(p.requirement)
                    const userAns = parsedAnswer[pIdx]

                    return (
                      <div key={pIdx} style={{ borderBottom: '1px solid #e8eff5' }}>
                        {/* Requirement */}
                        <div style={{ padding: '10px 16px', background: '#f8fafc', borderBottom: '1px solid #e8eff5' }}>
                          <span style={{ fontWeight: 700, fontSize: 13, color: '#1a2b4a' }}>Part {p.part}: </span>
                          <span style={{ fontSize: 13, color: '#333' }}>{p.requirement}</span>
                          {needsSheet && <span style={{ marginLeft: 8, fontSize: 11, color: '#0f4c81' }}>📊</span>}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                          {/* Student answer */}
                          <div style={{ padding: '10px 16px', borderRight: '1px solid #e8eff5' }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: '#7a9cbd', textTransform: 'uppercase', marginBottom: 6 }}>Your Answer</div>
                            <div style={{ fontSize: 12, color: '#333', background: '#fafcff', border: '1px solid #e8eff5', padding: '8px 10px', minHeight: 80, maxHeight: 200, overflowY: 'auto', lineHeight: 1.6 }}>
                              {userAns
                                ? needsSheet
                                  ? <span style={{ color: '#5a7a9a', fontStyle: 'italic' }}>Spreadsheet answer submitted</span>
                                  : <div dangerouslySetInnerHTML={{ __html: userAns }} />
                                : <span style={{ color: '#bbb', fontStyle: 'italic' }}>No answer provided</span>
                              }
                            </div>
                          </div>

                          {/* Model answer */}
                          <div style={{ padding: '10px 16px' }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: '#1a7a45', textTransform: 'uppercase', marginBottom: 6 }}>Model Answer</div>
                            <div style={{ fontSize: 12, color: '#1a4a2a', background: '#f0faf4', border: '1px solid #9de0b8', padding: '8px 10px', minHeight: 80, maxHeight: 200, overflowY: 'auto', whiteSpace: 'pre-wrap', lineHeight: 1.65 }}>
                              {p.answer || 'No model answer provided.'}
                            </div>
                          </div>
                        </div>

                        {/* Self-mark */}
                        <div style={{ padding: '8px 16px', background: '#fffbf0', borderTop: '1px solid #f5e88a', display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 12, color: '#7a5a00', fontWeight: 600 }}>Self-mark:</span>
                          <input
                            type="number"
                            min="0"
                            max={maxM || 20}
                            value={selfMarks[key] ?? ''}
                            onChange={e => setSelfMarks(prev => ({ ...prev, [key]: e.target.value }))}
                            style={{ width: 56, textAlign: 'center', border: '1px solid #f5c842', padding: '3px 6px', fontSize: 13, fontWeight: 700, outline: 'none' }}
                            placeholder="0"
                          />
                          {maxM && <span style={{ fontSize: 12, color: '#9a7a00' }}>/ {maxM} marks</span>}
                          {selfMarks[key] && maxM && parseInt(selfMarks[key]) > maxM && (
                            <span style={{ fontSize: 11, color: '#c00', marginLeft: 4 }}>⚠ Exceeds max marks</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}

            {bySection.C.length > 0 && (
              <div style={{ textAlign: 'right', padding: '12px 0', fontSize: 14, fontWeight: 700, color: '#1a2b4a', borderTop: '2px solid #d0d9e4', marginTop: 8 }}>
                Section C Self-Total: <span style={{ color: '#0f4c81', fontSize: 18 }}>{cSelfTotal}</span> marks
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
