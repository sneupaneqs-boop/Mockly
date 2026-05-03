import React, { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { normalizeQuestion, markAnswer, requiresSpreadsheet } from '../lib/questionUtils'
import { Icons } from '../components/Icons'
import { exportWord, exportExcel } from '../lib/examExporter'

function parseMaxMarks(requirement) {
  const m = (requirement || '').match(/\((\d+)\s*marks?\)/i)
  return m ? parseInt(m[1]) : null
}

function ScoreBadge({ label, score, max, color }) {
  const pct = max ? Math.round(score / max * 100) : 0
  const pass = pct >= 50
  return (
    <div style={{ background: 'rgba(255,255,255,.1)', borderRadius: 16, padding: '16px 22px', textAlign: 'center', minWidth: 130, backdropFilter: 'blur(4px)' }}>
      <div style={{ fontSize: 30, fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>
        {score}<span style={{ fontSize: 16, opacity: .5 }}>/{max}</span>
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</div>
      <div style={{ marginTop: 8, height: 4, background: 'rgba(0,0,0,.2)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: pass ? '#16A37B' : '#F43F76', transition: 'width .6s', borderRadius: 4 }}/>
      </div>
      <div style={{ fontSize: 10, color: pass ? '#6EE7B7' : '#FCA5A5', marginTop: 4, fontWeight: 700 }}>{pct}% {pass ? '✓ Pass' : '✗ Fail'}</div>
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

  return (
    <div style={{
      border: '1px solid',
      borderColor: isTextType ? 'var(--gold)' : isCorrect ? 'rgba(22,163,123,.3)' : 'rgba(244,63,118,.3)',
      borderRadius: 14, marginBottom: 10, overflow: 'hidden', background: 'var(--surface)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        padding: '12px 16px',
        background: isTextType ? 'rgba(245,179,59,.06)' : isCorrect ? 'rgba(22,163,123,.06)' : 'rgba(244,63,118,.06)',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontWeight: 700, fontSize: 12, color: 'var(--ink)', fontFamily: 'var(--font-mono)' }}>Q{qNum}</span>
            {q.answer_type && <span className="tag" style={{ fontSize: 10 }}>{q.answer_type}</span>}
            {q.exam_session && <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{q.exam_session}</span>}
          </div>
          {q.scenario && (
            <div style={{ fontSize: 11, color: 'var(--ink-3)', background: 'var(--bg)', padding: '4px 8px', marginBottom: 6, borderRadius: 8, lineHeight: 1.5, maxHeight: 48, overflow: 'hidden' }}>
              {q.scenario.substring(0, 160)}…
            </div>
          )}
          <p style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.55, margin: 0 }}>{q.question_text}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 16, flexShrink: 0 }}>
          <span style={{
            fontSize: 13, fontWeight: 700, padding: '3px 10px', borderRadius: 8,
            background: isTextType ? 'rgba(245,179,59,.15)' : isCorrect ? 'rgba(22,163,123,.15)' : 'rgba(244,63,118,.15)',
            color: isTextType ? 'var(--gold)' : isCorrect ? 'var(--green)' : 'var(--rose)',
          }}>
            {isTextType ? 'Self-mark' : isCorrect ? `✓ +${marks}` : '✗ 0'}
          </span>
          <button
            onClick={() => setExpanded(e => !e)}
            className="btn btn-sm"
          >
            {expanded ? 'Hide' : 'Explain'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid var(--line)' }}>
        <div style={{ padding: '8px 14px', borderRight: '1px solid var(--line)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Your Answer</div>
          <div style={{ fontSize: 13, padding: '4px 8px', background: isTextType ? 'rgba(245,179,59,.1)' : isCorrect ? 'rgba(22,163,123,.1)' : 'rgba(244,63,118,.1)', borderRadius: 8, color: isCorrect ? 'var(--green)' : 'var(--ink)', fontWeight: 600 }}>
            {item.user_answer || <span style={{ color: 'var(--ink-3)', fontStyle: 'italic', fontWeight: 400 }}>No answer</span>}
          </div>
        </div>
        <div style={{ padding: '8px 14px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Correct Answer</div>
          <div style={{ fontSize: 13, padding: '4px 8px', background: 'rgba(22,163,123,.1)', borderRadius: 8, color: 'var(--green)', fontWeight: 600 }}>
            {q.correct_answer || <span style={{ color: 'var(--ink-3)', fontStyle: 'italic', fontWeight: 400 }}>—</span>}
          </div>
        </div>
      </div>

      {q.options && expanded && (
        <div style={{ padding: '10px 14px', borderTop: '1px solid var(--line)', background: 'var(--bg)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: 8 }}>Options</div>
          {Object.entries(q.options).map(([k, v]) => {
            const correctLetters = (q.correct_answer || '').split(',').map(s => s.trim().toUpperCase())
            const isCorrectOpt = correctLetters.includes(k)
            const isUserOpt = (item.user_answer || '').split(',').map(s => s.trim().toUpperCase()).includes(k)
            return (
              <div key={k} style={{ display: 'flex', gap: 8, marginBottom: 4, padding: '4px 8px', borderRadius: 8, background: isCorrectOpt ? 'rgba(22,163,123,.1)' : isUserOpt && !isCorrectOpt ? 'rgba(244,63,118,.1)' : 'transparent' }}>
                <span style={{ fontWeight: 700, fontSize: 12, color: isCorrectOpt ? 'var(--green)' : isUserOpt ? 'var(--rose)' : 'var(--accent)', minWidth: 18 }}>{k}.</span>
                <span style={{ fontSize: 12, color: 'var(--ink)', lineHeight: 1.5, flex: 1 }}>{v}</span>
                {isCorrectOpt && <span style={{ fontSize: 10, color: 'var(--green)', fontWeight: 700, flexShrink: 0 }}>✓</span>}
              </div>
            )
          })}
        </div>
      )}

      {expanded && q.explanation && (
        <div style={{ padding: '12px 14px', borderTop: '1px solid var(--line)', background: 'var(--surface)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 8 }}>Explanation</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{q.explanation}</div>
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
  const [selfMarks, setSelfMarks] = useState({})
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(null)

  useEffect(() => {
    async function load() {
      const { data: sess } = await supabase.from('mock_sessions').select('*').eq('id', id).single()
      setSession(sess)
      const { data: mqs } = await supabase.from('mock_questions').select('*').eq('mock_id', id).order('display_order')

      const abIds = (mqs || []).filter(q => q.question_table === 'questions').map(q => q.question_id)
      const cIds = (mqs || []).filter(q => q.question_table === 'section_c').map(q => q.question_id)

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
      setTab(enriched[0]?.section || 'A')
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

  async function handleExportWord() {
    setExporting('word')
    await exportWord(session, items)
    setExporting(null)
  }

  async function handleExportExcel() {
    setExporting('excel')
    await exportExcel(session, items)
    setExporting(null)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--ink-3)', fontSize: 14 }}>
        Calculating results…
      </div>
    )
  }

  const tabs = ['A', 'B', 'C'].filter(s => bySection[s].length > 0)
  const hasC = bySection.C.length > 0
  const totalAB = scoreA + scoreB
  const maxAB = bySection.A.length * 2 + bySection.B.length * 2
  const pctAB = maxAB ? Math.round(totalAB / maxAB * 100) : 0

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'var(--font-sans)' }}>
      {/* Top bar */}
      <div style={{ background: 'linear-gradient(135deg, #111B30 0%, #1F2C4D 100%)', padding: '0 28px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18, color: '#fff' }}>Mockly</div>
          <span style={{ color: 'rgba(255,255,255,.3)', fontSize: 18 }}>·</span>
          <span style={{ color: 'rgba(255,255,255,.7)', fontSize: 13 }}>Results — {session?.subject} Mock Exam</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {hasC && (
            <>
              <button
                className="btn btn-sm"
                style={{ color: '#fff', borderColor: 'rgba(255,255,255,.2)', background: 'rgba(255,255,255,.08)' }}
                onClick={handleExportWord}
                disabled={!!exporting}
              >
                <Icons.fileDoc size={13}/> {exporting === 'word' ? 'Exporting…' : 'Word (.docx)'}
              </button>
              <button
                className="btn btn-sm"
                style={{ color: '#fff', borderColor: 'rgba(255,255,255,.2)', background: 'rgba(255,255,255,.08)' }}
                onClick={handleExportExcel}
                disabled={!!exporting}
              >
                <Icons.fileXls size={13}/> {exporting === 'excel' ? 'Exporting…' : 'Excel (.xlsx)'}
              </button>
            </>
          )}
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-sm"
            style={{ color: '#fff', borderColor: 'rgba(255,255,255,.2)', background: 'rgba(255,255,255,.08)' }}
          >
            <Icons.arrow size={12} style={{ transform: 'rotate(180deg)' }}/> Dashboard
          </button>
        </div>
      </div>

      {/* Score banner */}
      <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E2D4D 100%)', padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
        {bySection.A.length > 0 && <ScoreBadge label="Section A — MCQ" score={scoreA} max={bySection.A.length * 2}/>}
        {bySection.B.length > 0 && <ScoreBadge label="Section B — MTQ" score={scoreB} max={bySection.B.length * 2}/>}
        {bySection.C.length > 0 && <ScoreBadge label="Section C (Self)" score={cSelfTotal} max={40}/>}
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Auto-marked total</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 600, color: pctAB >= 50 ? '#6EE7B7' : '#FCA5A5' }}>{totalAB}<span style={{ fontSize: 20, opacity: .5 }}>/{maxAB}</span></div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>{pctAB}% — {pctAB >= 50 ? 'Pass ✓' : 'Below pass mark'}</div>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 20px' }}>
        {/* Section tabs */}
        <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, marginBottom: 24, width: 'fit-content' }}>
          {tabs.map(s => (
            <button
              key={s}
              onClick={() => setTab(s)}
              style={{
                padding: '7px 18px', fontSize: 13, fontWeight: tab === s ? 700 : 500,
                color: tab === s ? '#fff' : 'var(--ink-3)',
                background: tab === s ? 'var(--accent)' : 'transparent',
                border: 'none', cursor: 'pointer', borderRadius: 10, transition: 'all .15s',
              }}
            >
              Section {s}
              {s === 'A' && ` · ${scoreA}/${bySection.A.length * 2}`}
              {s === 'B' && ` · ${scoreB}/${bySection.B.length * 2}`}
              {s === 'C' && ` · ${cSelfTotal} self`}
            </button>
          ))}
        </div>

        {/* Section A & B */}
        {(tab === 'A' || tab === 'B') && (
          <div>
            {bySection[tab].map((item, idx) => (
              <QuestionResultCard key={item.id} item={item} qNum={idx + 1}/>
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
                <div key={item.id} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 18, marginBottom: 24, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 18px', background: 'var(--accent-soft)', borderBottom: '1px solid var(--line)' }}>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 4 }}>{q.topic_name} · {q.exam_session}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>Question C{qIdx + 1}</div>
                  </div>

                  <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)', background: 'var(--bg)', maxHeight: 200, overflowY: 'auto' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Scenario</div>
                    <div style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{q.scenario}</div>
                  </div>

                  {parts.map((p, pIdx) => {
                    const key = `${item.id}_${pIdx}`
                    const maxM = parseMaxMarks(p.requirement)
                    const needsSheet = requiresSpreadsheet(p.requirement)
                    const userAns = parsedAnswer[pIdx]

                    return (
                      <div key={pIdx} style={{ borderBottom: '1px solid var(--line)' }}>
                        <div style={{ padding: '12px 18px', background: 'var(--surface)', borderBottom: '1px solid var(--line)', display: 'flex', gap: 8, alignItems: 'baseline' }}>
                          <span style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--ink)' }}>Part {p.part}:</span>
                          <span style={{ fontSize: 13, color: 'var(--ink)' }}>{p.requirement}</span>
                          {needsSheet && <Icons.fileXls size={13} style={{ color: 'var(--green)', flexShrink: 0 }}/>}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                          <div style={{ padding: '12px 18px', borderRight: '1px solid var(--line)' }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Your Answer</div>
                            <div style={{ fontSize: 12.5, color: 'var(--ink)', background: 'var(--bg)', border: '1px solid var(--line)', padding: '10px 12px', minHeight: 80, maxHeight: 200, overflowY: 'auto', borderRadius: 10, lineHeight: 1.65 }}>
                              {userAns
                                ? needsSheet
                                  ? <span style={{ color: 'var(--ink-3)', fontStyle: 'italic' }}>Spreadsheet answer submitted</span>
                                  : <div dangerouslySetInnerHTML={{ __html: userAns }}/>
                                : <span style={{ color: 'var(--ink-3)', fontStyle: 'italic' }}>No answer provided</span>
                              }
                            </div>
                          </div>

                          <div style={{ padding: '12px 18px' }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Model Answer</div>
                            <div style={{ fontSize: 12.5, color: 'var(--ink)', background: 'rgba(22,163,123,.06)', border: '1px solid rgba(22,163,123,.2)', padding: '10px 12px', minHeight: 80, maxHeight: 200, overflowY: 'auto', borderRadius: 10, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                              {p.answer || 'No model answer provided.'}
                            </div>
                          </div>
                        </div>

                        <div style={{ padding: '10px 18px', background: 'rgba(245,179,59,.06)', borderTop: '1px solid rgba(245,179,59,.2)', display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 12.5, color: 'var(--ink)', fontWeight: 600 }}>Self-mark:</span>
                          <input
                            type="number"
                            min="0"
                            max={maxM || 20}
                            value={selfMarks[key] ?? ''}
                            onChange={e => setSelfMarks(prev => ({ ...prev, [key]: e.target.value }))}
                            style={{ width: 60, textAlign: 'center', border: '1.5px solid var(--gold)', padding: '4px 8px', fontSize: 14, fontWeight: 700, outline: 'none', borderRadius: 8, color: 'var(--ink)', background: 'var(--surface)', fontFamily: 'var(--font-mono)' }}
                            placeholder="0"
                          />
                          {maxM && <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>/ {maxM} marks</span>}
                          {selfMarks[key] && maxM && parseInt(selfMarks[key]) > maxM && (
                            <span style={{ fontSize: 11, color: 'var(--rose)', fontWeight: 600 }}>⚠ Exceeds max</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}

            {bySection.C.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14 }}>
                <span style={{ fontSize: 14, color: 'var(--ink-3)' }}>Section C Self-Total</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, color: 'var(--accent)' }}>{cSelfTotal} <span style={{ fontSize: 14, opacity: .5 }}>marks</span></span>
              </div>
            )}

            {hasC && (
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button className="btn btn-sm" onClick={handleExportWord} disabled={!!exporting}>
                  <Icons.fileDoc size={13}/> {exporting === 'word' ? 'Exporting…' : 'Download Word (.docx)'}
                </button>
                <button className="btn btn-sm" onClick={handleExportExcel} disabled={!!exporting}>
                  <Icons.fileXls size={13}/> {exporting === 'excel' ? 'Exporting…' : 'Download Excel (.xlsx)'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
