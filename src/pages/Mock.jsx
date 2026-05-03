import React, { useEffect, useState, useCallback, useRef, useMemo, lazy, Suspense } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { normalizeQuestion, requiresSpreadsheet } from '../lib/questionUtils'

const Spreadsheet = lazy(() => import('../components/Spreadsheet'))
const WordProcessor = lazy(() => import('../components/WordProcessor'))

// ─── Timer ────────────────────────────────────────────────────────────────────
function Timer({ initialSecs }) {
  const [secs, setSecs] = useState(initialSecs)
  useEffect(() => {
    const t = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [])
  const h = String(Math.floor(secs / 3600)).padStart(2, '0')
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0')
  const s = String(secs % 60).padStart(2, '0')
  const urgent = secs < 600
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 11, color: '#9ab3d4' }}>TIME REMAINING</span>
      <span style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 700, color: urgent ? '#ff6b6b' : '#fff', background: urgent ? 'rgba(255,100,100,0.15)' : 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: 3 }}>
        {h}:{m}:{s}
      </span>
    </div>
  )
}

// ─── Option Row (CBE style) ───────────────────────────────────────────────────
function OptionRow({ letter, text, selected, onClick, type = 'single' }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        border: `1px solid ${selected ? '#0f4c81' : '#c8d0da'}`,
        background: selected ? '#ddeeff' : '#fff',
        marginBottom: 4,
        cursor: 'pointer',
        padding: '8px 12px',
        transition: 'all 0.12s',
        borderRadius: 2,
        userSelect: 'none',
      }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.background = '#f0f5fb' }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.background = '#fff' }}
    >
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 28, height: 28, minWidth: 28,
        border: `2px solid ${selected ? '#0f4c81' : '#7a9cbd'}`,
        borderRadius: type === 'single' ? '50%' : 3,
        fontWeight: 700, fontSize: 13,
        color: selected ? '#fff' : '#0f4c81',
        background: selected ? '#0f4c81' : 'transparent',
        marginRight: 12, marginTop: 1, flexShrink: 0,
      }}>
        {letter}
      </span>
      <span style={{ fontSize: 14, color: '#222', lineHeight: 1.55, flex: 1 }}>{text}</span>
    </div>
  )
}

// ─── Section C part renderer ──────────────────────────────────────────────────
function SectionCAnswer({ part, partIdx, answer, onChange }) {
  const needsSheet = requiresSpreadsheet(part.requirement)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 0 }}>
      <div style={{ padding: '6px 10px', background: '#f0f4f8', borderBottom: '1px solid #d0d9e4', fontSize: 12, fontWeight: 600, color: '#1a2b4a', flexShrink: 0 }}>
        Part {part.part} — {needsSheet ? '📊 Spreadsheet Answer' : '📝 Written Answer'}
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Suspense fallback={<div style={{ padding: 20, color: '#999', fontSize: 13 }}>Loading editor…</div>}>
          {needsSheet
            ? <Spreadsheet value={answer} onChange={onChange} />
            : <WordProcessor value={answer} onChange={onChange} />
          }
        </Suspense>
      </div>
    </div>
  )
}

// ─── Section C Question (own component to keep hooks at top level) ────────────
function SectionCQuestion({ q, answer, onChange }) {
  const normalized = useMemo(() => normalizeQuestion(q), [q])
  const parts = normalized.parts || []
  const [activePart, setActivePart] = useState(0)
  const answers = useMemo(() => {
    try { return answer ? JSON.parse(answer) : {} } catch { return {} }
  }, [answer])
  const setPartAnswer = useCallback((idx, val) => {
    onChange(JSON.stringify({ ...answers, [idx]: val }))
  }, [answers, onChange])

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Left: Scenario + Requirements */}
      <div style={{ width: '40%', minWidth: 320, borderRight: '1px solid #d0d9e4', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', background: '#e8f0f8', borderBottom: '1px solid #d0d9e4', fontSize: 11, fontWeight: 700, color: '#0f4c81', textTransform: 'uppercase', letterSpacing: 0.5, flexShrink: 0 }}>
          Scenario &amp; Requirements
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>
          <div style={{ fontSize: 13, lineHeight: 1.65, color: '#1a1a1a', marginBottom: 16, whiteSpace: 'pre-wrap', fontFamily: 'Arial, sans-serif' }}>
            {normalized.scenario}
          </div>
          <div style={{ borderTop: '2px solid #0f4c81', paddingTop: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#0f4c81', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 }}>Requirements</div>
            {parts.map((p, i) => (
              <div
                key={i}
                onClick={() => setActivePart(i)}
                style={{
                  padding: '8px 10px', marginBottom: 4,
                  background: activePart === i ? '#ddeeff' : '#f8fafc',
                  border: `1px solid ${activePart === i ? '#0f4c81' : '#d0d9e4'}`,
                  cursor: 'pointer', borderRadius: 2, fontSize: 13, lineHeight: 1.5, color: '#1a2b4a',
                }}
              >
                <span style={{ fontWeight: 700 }}>Part {p.part}:</span> {p.requirement}
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Right: Answer editor */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {parts[activePart] && (
          <SectionCAnswer
            part={parts[activePart]}
            partIdx={activePart}
            answer={answers[activePart]}
            onChange={val => setPartAnswer(activePart, val)}
          />
        )}
      </div>
    </div>
  )
}

// ─── Question Content (router) ────────────────────────────────────────────────
function QuestionContent({ mq, q, answer, onChange }) {
  if (!q) return <div style={{ padding: 20, color: '#999' }}>Question not found.</div>

  if (mq.section === 'C') {
    return <SectionCQuestion q={q} answer={answer} onChange={onChange} />
  }

  // Section A/B — normalize and destructure
  const normalized = normalizeQuestion(q)
  const { answer_type, question_text, options, correct_answer, scenario, maxSelect } = normalized

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Scenario (Section B only) */}
      {scenario && (
        <div style={{ borderBottom: '1px solid #d0d9e4', padding: '12px 16px', overflowY: 'auto', maxHeight: '35%', background: '#f8fafc', flexShrink: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#0f4c81', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 }}>Scenario</div>
          <div style={{ fontSize: 13, lineHeight: 1.65, color: '#1a1a1a', whiteSpace: 'pre-wrap', fontFamily: 'Arial, sans-serif' }}>
            {scenario}
          </div>
        </div>
      )}

      {/* Question + Options */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        {/* Question text */}
        <p style={{ fontSize: 14, lineHeight: 1.7, color: '#1a1a1a', marginBottom: 16, fontFamily: 'Arial, sans-serif' }}>
          {question_text}
        </p>

        {/* Numeric answer */}
        {answer_type === 'numeric' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Enter your answer:</div>
            <input
              type="number"
              step="any"
              value={answer || ''}
              onChange={e => onChange(e.target.value)}
              style={{
                width: 180,
                textAlign: 'right',
                fontFamily: 'monospace',
                fontSize: 15,
                padding: '6px 10px',
                border: '2px solid #0f4c81',
                outline: 'none',
                background: '#fff',
              }}
              placeholder="0.00"
            />
          </div>
        )}

        {/* Multi-select hint */}
        {answer_type === 'multi' && maxSelect && (
          <div style={{ fontSize: 12, color: '#0f4c81', fontWeight: 600, marginBottom: 8, padding: '4px 8px', background: '#e8f0f8', borderRadius: 2, display: 'inline-block' }}>
            Select {maxSelect} option{maxSelect !== 1 ? 's' : ''}
          </div>
        )}

        {/* Options */}
        {options && Object.entries(options).map(([letter, text]) => {
          let selected
          if (answer_type === 'single') {
            selected = answer === letter
          } else {
            const vals = (answer || '').split(',').map(s => s.trim()).filter(Boolean)
            selected = vals.includes(letter)
          }

          return (
            <OptionRow
              key={letter}
              letter={letter}
              text={text}
              selected={selected}
              type={answer_type === 'multi' ? 'multi' : 'single'}
              onClick={() => {
                if (answer_type === 'single') {
                  onChange(letter)
                } else {
                  const vals = (answer || '').split(',').map(s => s.trim()).filter(Boolean)
                  let next
                  if (vals.includes(letter)) {
                    next = vals.filter(v => v !== letter)
                  } else {
                    if (maxSelect && vals.length >= maxSelect) {
                      next = [...vals.slice(1), letter]
                    } else {
                      next = [...vals, letter]
                    }
                  }
                  onChange(next.sort().join(', '))
                }
              }}
            />
          )
        })}

        {/* Text-type question (descriptive answer, self-mark) */}
        {answer_type === 'text' && !options && (
          <div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>Free-text answer (self-marked)</div>
            <textarea
              value={answer || ''}
              onChange={e => onChange(e.target.value)}
              rows={5}
              style={{ width: '100%', border: '1px solid #c8d0da', padding: '8px 10px', fontSize: 13, fontFamily: 'Arial, sans-serif', outline: 'none', resize: 'vertical' }}
              placeholder="Type your answer…"
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Navigator Cell ───────────────────────────────────────────────────────────
function NavCell({ label, state, onClick }) {
  const colors = {
    current:    { bg: '#2ecc71', color: '#fff', border: '#27ae60' },
    flagged:    { bg: '#f39c12', color: '#fff', border: '#e67e22' },
    answered:   { bg: '#0f4c81', color: '#fff', border: '#0d3d68' },
    unanswered: { bg: '#fff',    color: '#444', border: '#c0ccd8' },
  }
  const c = colors[state] || colors.unanswered
  return (
    <div
      onClick={onClick}
      title={label}
      style={{
        width: 36, height: 30,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10, fontWeight: 700,
        background: c.bg, color: c.color,
        border: `1px solid ${c.border}`,
        borderRadius: 2, cursor: 'pointer',
        userSelect: 'none',
        transition: 'all 0.1s',
      }}
    >
      {label}
    </div>
  )
}

// ─── Main Mock Page ───────────────────────────────────────────────────────────
export default function Mock() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const durationSecs = (location.state?.durationMins || 180) * 60

  const [session, setSession] = useState(null)
  const [mockQuestions, setMockQuestions] = useState([])
  const [questionData, setQuestionData] = useState({})
  const [answers, setAnswers] = useState({})
  const [flagged, setFlagged] = useState(new Set())
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: sess } = await supabase.from('mock_sessions').select('*').eq('id', id).single()
      setSession(sess)

      const { data: mqs } = await supabase
        .from('mock_questions').select('*').eq('mock_id', id).order('display_order')
      setMockQuestions(mqs || [])

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

      const existingAnswers = {}
      for (const mq of mqs || []) {
        if (mq.user_answer != null) existingAnswers[mq.id] = mq.user_answer
      }
      setAnswers(existingAnswers)
      setQuestionData(qMap)
      setLoading(false)
    }
    load()
  }, [id])

  // Build navigator items
  const navItems = useMemo(() => {
    const items = []
    let bGroupIdx = 0
    let prevBTopic = null
    const bSubCount = {}

    mockQuestions.forEach((mq, idx) => {
      const q = questionData[mq.question_id]

      if (mq.section === 'A') {
        items.push({ mq, idx, label: String(idx + 1), section: 'A' })
      } else if (mq.section === 'B') {
        const topicNum = q?.topic_number
        if (topicNum !== prevBTopic) { bGroupIdx++; prevBTopic = topicNum; bSubCount[bGroupIdx] = 0 }
        const sub = String.fromCharCode(97 + (bSubCount[bGroupIdx] || 0))
        bSubCount[bGroupIdx] = (bSubCount[bGroupIdx] || 0) + 1
        items.push({ mq, idx, label: `B${bGroupIdx}${sub}`, section: 'B' })
      } else {
        const cIdx = items.filter(i => i.section === 'C').length + 1
        items.push({ mq, idx, label: `C${cIdx}`, section: 'C' })
      }
    })
    return items
  }, [mockQuestions, questionData])

  const navBySection = useMemo(() => ({
    A: navItems.filter(n => n.section === 'A'),
    B: navItems.filter(n => n.section === 'B'),
    C: navItems.filter(n => n.section === 'C'),
  }), [navItems])

  const currentMQ = mockQuestions[current]
  const currentQ  = currentMQ ? questionData[currentMQ.question_id] : null
  const currentNav = navItems[current]

  function setAnswer(val) {
    if (!currentMQ) return
    setAnswers(prev => ({ ...prev, [currentMQ.id]: val }))
  }

  function toggleFlag() {
    setFlagged(prev => { const n = new Set(prev); n.has(current) ? n.delete(current) : n.add(current); return n })
  }

  function getCellState(idx) {
    if (idx === current) return 'current'
    if (flagged.has(idx)) return 'flagged'
    const mq = mockQuestions[idx]
    if (mq && answers[mq.id]) return 'answered'
    return 'unanswered'
  }

  async function handleSubmit() {
    const answeredCount = Object.keys(answers).length
    const total = mockQuestions.length
    if (!window.confirm(`Submit mock?\n\nAnswered: ${answeredCount}/${total}\n\nYou cannot change answers after submission.`)) return
    setSubmitting(true)

    for (const mq of mockQuestions) {
      await supabase.from('mock_questions').update({ user_answer: answers[mq.id] ?? null }).eq('id', mq.id)
    }
    await supabase.from('mock_sessions').update({ completed_at: new Date().toISOString() }).eq('id', id)
    navigate(`/mock/${id}/results`)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f0f4f8', gap: 12 }}>
        <div style={{ width: 40, height: 40, border: '3px solid #0f4c81', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <div style={{ color: '#0f4c81', fontSize: 14, fontWeight: 600 }}>Loading mock exam…</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  const sectionACount = navBySection.A.length
  const sectionBCount = navBySection.B.length
  const sectionCCount = navBySection.C.length
  const answeredCount = Object.keys(answers).length
  const progressPct = mockQuestions.length ? Math.round(answeredCount / mockQuestions.length * 100) : 0

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: 'Arial, Helvetica, sans-serif' }}>

      {/* ── Top Bar ── */}
      <div style={{ height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', background: '#1a2b4a', flexShrink: 0, gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 15, letterSpacing: 0.3 }}>Mockly</span>
          <span style={{ color: '#7a9cbd', fontSize: 12 }}>|</span>
          <span style={{ color: '#c8d8e8', fontSize: 13 }}>{session?.subject} Mock Exam</span>
          <span style={{ color: '#7a9cbd', fontSize: 12 }}>|</span>
          <span style={{ color: '#c8d8e8', fontSize: 12 }}>
            {currentMQ?.section === 'A' ? 'Section A — MCQ' : currentMQ?.section === 'B' ? 'Section B — MTQ' : 'Section C — Long Form'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Timer initialSecs={durationSecs} />
          <button
            onClick={toggleFlag}
            style={{
              padding: '4px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid',
              borderColor: flagged.has(current) ? '#f39c12' : 'rgba(255,255,255,0.35)',
              background: flagged.has(current) ? '#f39c12' : 'transparent',
              color: flagged.has(current) ? '#fff' : '#c8d8e8',
              borderRadius: 2, transition: 'all 0.15s',
            }}
          >
            {flagged.has(current) ? '★ Flagged' : '☆ Flag'}
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{ padding: '5px 16px', fontSize: 12, fontWeight: 700, background: '#0f4c81', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: 2, opacity: submitting ? 0.6 : 1 }}
          >
            {submitting ? 'Submitting…' : 'Submit Exam'}
          </button>
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div style={{ height: 3, background: '#2a3d5a', flexShrink: 0 }}>
        <div style={{ height: '100%', width: `${progressPct}%`, background: '#0f4c81', transition: 'width 0.3s' }} />
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── Left Navigator ── */}
        <div style={{ width: 200, background: '#f4f7fb', borderRight: '1px solid #d0d9e4', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
          {/* Progress summary */}
          <div style={{ padding: '10px 12px', borderBottom: '1px solid #d0d9e4', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#5a7a9a', marginBottom: 4 }}>
              <span>Progress</span>
              <span style={{ fontWeight: 700, color: '#0f4c81' }}>{answeredCount}/{mockQuestions.length}</span>
            </div>
            <div style={{ height: 4, background: '#e0e8f0', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progressPct}%`, background: '#0f4c81', transition: 'width 0.3s' }} />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px' }}>
            {/* Section A */}
            {navBySection.A.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#5a7a9a', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, padding: '0 2px' }}>
                  Section A — MCQ <span style={{ color: '#0f4c81' }}>({navBySection.A.length})</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  {navBySection.A.map(item => (
                    <NavCell key={item.idx} label={item.label} state={getCellState(item.idx)} onClick={() => setCurrent(item.idx)} />
                  ))}
                </div>
              </div>
            )}

            {/* Section B */}
            {navBySection.B.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#5a7a9a', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, padding: '0 2px' }}>
                  Section B — MTQ <span style={{ color: '#0f4c81' }}>({navBySection.B.length})</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  {navBySection.B.map(item => (
                    <NavCell key={item.idx} label={item.label} state={getCellState(item.idx)} onClick={() => setCurrent(item.idx)} />
                  ))}
                </div>
              </div>
            )}

            {/* Section C */}
            {navBySection.C.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#5a7a9a', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, padding: '0 2px' }}>
                  Section C — Long Form <span style={{ color: '#0f4c81' }}>({navBySection.C.length})</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  {navBySection.C.map(item => (
                    <NavCell key={item.idx} label={item.label} state={getCellState(item.idx)} onClick={() => setCurrent(item.idx)} />
                  ))}
                </div>
              </div>
            )}

            {/* Legend */}
            <div style={{ borderTop: '1px solid #d0d9e4', paddingTop: 10, marginTop: 4 }}>
              {[
                ['#fff', '#c0ccd8', 'Unanswered'],
                ['#0f4c81', '#0d3d68', 'Answered'],
                ['#f39c12', '#e67e22', 'Flagged'],
                ['#2ecc71', '#27ae60', 'Current'],
              ].map(([bg, border, label]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, fontSize: 10, color: '#5a7a9a' }}>
                  <div style={{ width: 14, height: 14, background: bg, border: `1px solid ${border}`, borderRadius: 2, flexShrink: 0 }} />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Question Panel ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#fff' }}>
          {/* Question header */}
          <div style={{ height: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', borderBottom: '1px solid #d0d9e4', background: '#f8fafc', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1a2b4a' }}>
                {currentNav?.label || `Q${current + 1}`}
              </span>
              <span style={{ fontSize: 11, color: '#7a9cbd' }}>of {mockQuestions.length}</span>
              {currentQ?.answer_type && currentMQ?.section !== 'C' && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10, background: '#e8f0f8', color: '#0f4c81', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {currentQ.answer_type}
                </span>
              )}
              {currentQ?.exam_session && (
                <span style={{ fontSize: 11, color: '#9ab3cc' }}>{currentQ.exam_session}</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                disabled={current === 0}
                onClick={() => setCurrent(c => c - 1)}
                style={{ padding: '4px 12px', fontSize: 12, border: '1px solid #c0ccd8', background: '#fff', cursor: current === 0 ? 'not-allowed' : 'pointer', opacity: current === 0 ? 0.4 : 1, borderRadius: 2, color: '#1a2b4a' }}
              >← Prev</button>
              <button
                disabled={current === mockQuestions.length - 1}
                onClick={() => setCurrent(c => c + 1)}
                style={{ padding: '4px 12px', fontSize: 12, background: '#0f4c81', color: '#fff', border: 'none', cursor: current === mockQuestions.length - 1 ? 'not-allowed' : 'pointer', opacity: current === mockQuestions.length - 1 ? 0.5 : 1, borderRadius: 2 }}
              >Next →</button>
            </div>
          </div>

          {/* Question body */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {currentQ && currentMQ ? (
              <QuestionContent
                key={currentMQ.id}
                mq={currentMQ}
                q={{ ...currentQ, section: currentMQ.section }}
                answer={answers[currentMQ.id]}
                onChange={setAnswer}
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999', fontSize: 14 }}>
                No question loaded.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
