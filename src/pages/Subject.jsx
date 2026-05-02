import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { normalizeQuestion } from '../lib/questionUtils'

const SECTION_LABELS = { A: 'MCQ — Section A', B: 'MTQ — Section B', C: 'Long Form — Section C' }

export default function Subject() {
  const { subject } = useParams()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const [topicsAB, setTopicsAB] = useState({ A: [], B: [] })
  const [topicsC, setTopicsC] = useState([])
  const [tab, setTab] = useState('A')
  const [selected, setSelected] = useState(null)
  const [questions, setQuestions] = useState([])
  const [loadingTopics, setLoadingTopics] = useState(true)
  const [loadingQs, setLoadingQs] = useState(false)

  useEffect(() => {
    async function load() {
      const [{ data: ab }, { data: c }] = await Promise.all([
        supabase.from('questions').select('section, topic_number, topic_name').eq('subject', subject),
        supabase.from('section_c').select('topic_number, topic_name').eq('subject', subject),
      ])
      const mapA = new Map(), mapB = new Map()
      for (const r of ab || []) {
        if (r.section === 'A') mapA.set(r.topic_number, r.topic_name)
        if (r.section === 'B') mapB.set(r.topic_number, r.topic_name)
      }
      const mapC = new Map()
      for (const r of c || []) mapC.set(r.topic_number, r.topic_name)

      const sortEntries = m => [...m.entries()].sort((a, b) => a[0] - b[0])
      setTopicsAB({ A: sortEntries(mapA), B: sortEntries(mapB) })
      setTopicsC(sortEntries(mapC))
      setLoadingTopics(false)
    }
    load()
  }, [subject])

  async function selectTopic(section, topicNum, topicName) {
    setSelected({ section, topicNum, topicName })
    setLoadingQs(true)
    if (section === 'C') {
      const { data } = await supabase
        .from('section_c').select('*').eq('subject', subject).eq('topic_number', topicNum)
      setQuestions(data || [])
    } else {
      const { data } = await supabase
        .from('questions').select('*')
        .eq('subject', subject).eq('section', section).eq('topic_number', topicNum)
        .order('q_number')
      setQuestions((data || []).map(normalizeQuestion))
    }
    setLoadingQs(false)
  }

  const currentList = tab === 'C' ? topicsC : topicsAB[tab]

  const answerTypeBadge = (type) => {
    const map = { single: ['#e8f0f8', '#0f4c81', 'Single'], multi: ['#eaf4ee', '#1a7a45', 'Multi'], numeric: ['#fff8e0', '#a06000', 'Numeric'], text: ['#f8eeff', '#6a30a0', 'Text'] }
    const [bg, color, label] = map[type] || ['#f0f0f0', '#666', type]
    return <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10, background: bg, color, textTransform: 'uppercase', letterSpacing: 0.3 }}>{label}</span>
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: 'Arial, Helvetica, sans-serif' }}>
      {/* Top bar */}
      <div style={{ height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', background: '#1a2b4a', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/dashboard')} style={{ color: '#7ab3d4', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>← Dashboard</button>
          <span style={{ color: '#3a5a7a' }}>|</span>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Mockly</span>
          <span style={{ color: '#3a5a7a' }}>|</span>
          <span style={{ color: '#c8d8e8', fontSize: 13 }}>{subject} — Question Browser</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => navigate('/mock/create', { state: { subject } })}
            style={{ padding: '5px 16px', fontSize: 12, fontWeight: 700, background: '#0f4c81', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: 2 }}
          >
            + Create Mock
          </button>
          <button onClick={() => { logout(); navigate('/login') }} style={{ fontSize: 12, color: '#c8d8e8', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', padding: '5px 12px', cursor: 'pointer', borderRadius: 2 }}>
            Sign out
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{ width: 260, background: '#f4f7fb', borderRight: '1px solid #d0d9e4', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
          {/* Section tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #d0d9e4', background: '#fff', flexShrink: 0 }}>
            {['A', 'B', 'C'].map(s => (
              <button
                key={s}
                onClick={() => { setTab(s); setSelected(null); setQuestions([]) }}
                style={{
                  flex: 1, padding: '10px 0', fontSize: 11, fontWeight: tab === s ? 700 : 500,
                  color: tab === s ? '#0f4c81' : '#5a7a9a',
                  borderBottom: tab === s ? '2px solid #0f4c81' : '2px solid transparent',
                  background: 'none', border: 'none', cursor: 'pointer', marginBottom: -1,
                }}
              >
                {s === 'A' ? 'MCQ' : s === 'B' ? 'MTQ' : 'Sec C'}
              </button>
            ))}
          </div>

          <div style={{ fontSize: 10, fontWeight: 700, color: '#9ab3cc', textTransform: 'uppercase', letterSpacing: 0.5, padding: '10px 14px 6px' }}>
            {SECTION_LABELS[tab]}
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loadingTopics ? (
              <div style={{ padding: 20, color: '#9ab3cc', fontSize: 12 }}>Loading…</div>
            ) : currentList.length === 0 ? (
              <div style={{ padding: 20, color: '#b0c0cc', fontSize: 12 }}>No topics available</div>
            ) : (
              currentList.map(([num, name]) => {
                const isActive = selected?.topicNum === num && selected?.section === tab
                return (
                  <button
                    key={num}
                    onClick={() => selectTopic(tab, num, name)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '9px 14px',
                      borderBottom: '1px solid #e8eff5',
                      background: isActive ? '#ddeeff' : 'transparent',
                      border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                      borderLeft: isActive ? '3px solid #0f4c81' : '3px solid transparent',
                      transition: 'all 0.1s',
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f0f6ff' }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                  >
                    <span style={{ fontSize: 11, color: '#9ab3cc', minWidth: 24 }}>{num}.</span>
                    <span style={{ fontSize: 12, color: isActive ? '#0f4c81' : '#1a2b4a', fontWeight: isActive ? 700 : 400, lineHeight: 1.4 }}>{name}</span>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Main panel */}
        <div style={{ flex: 1, overflowY: 'auto', background: '#fff' }}>
          {!selected ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ab3cc' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: 12 }}>
                <path d="M9 17H7A5 5 0 0 1 7 7h2" /><path d="M15 7h2a5 5 0 1 1 0 10h-2" /><line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Select a chapter from the left</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>to browse questions</div>
            </div>
          ) : (
            <div style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid #e8eff5' }}>
                <div>
                  <div style={{ fontSize: 11, color: '#9ab3cc', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>Section {selected.section} — {SECTION_LABELS[selected.section]}</div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a2b4a', margin: 0 }}>
                    {selected.topicNum}. {selected.topicName}
                  </h2>
                </div>
                <div style={{ fontSize: 12, color: '#7a9cbd' }}>{loadingQs ? '…' : `${questions.length} questions`}</div>
              </div>

              {loadingQs ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#9ab3cc' }}>Loading questions…</div>
              ) : selected.section === 'C' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {questions.map((q, i) => (
                    <div key={q.id} style={{ border: '1px solid #d8e2ee', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ padding: '10px 14px', background: '#f4f7fb', borderBottom: '1px solid #e0e8f2', display: 'flex', gap: 10, fontSize: 11, color: '#7a9cbd' }}>
                        <span>{q.exam_session}</span>
                        <span>|</span>
                        <span>{q.category}</span>
                        <span>|</span>
                        <span>{(q.parts || []).length} parts</span>
                      </div>
                      <div style={{ padding: '10px 14px', fontSize: 13, color: '#333', lineHeight: 1.6, maxHeight: 80, overflow: 'hidden', position: 'relative' }}>
                        {q.scenario?.substring(0, 200)}…
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {questions.map((q, i) => (
                    <div key={q.id} style={{ border: '1px solid #d8e2ee', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ padding: '8px 14px', background: '#f4f7fb', borderBottom: '1px solid #e0e8f2', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#1a2b4a' }}>Q{q.q_number}</span>
                        {answerTypeBadge(q.answer_type)}
                        {q.exam_session && <span style={{ fontSize: 11, color: '#9ab3cc' }}>{q.exam_session}</span>}
                      </div>
                      {q.scenario && (
                        <div style={{ padding: '6px 14px', background: '#f8f6ff', borderBottom: '1px solid #e8e4f5', fontSize: 11, color: '#6a4a9a', lineHeight: 1.5, maxHeight: 40, overflow: 'hidden' }}>
                          {q.scenario?.substring(0, 120)}…
                        </div>
                      )}
                      <div style={{ padding: '10px 14px' }}>
                        <p style={{ fontSize: 13, color: '#1a1a1a', lineHeight: 1.6, margin: '0 0 8px' }}>{q.question_text}</p>
                        {q.options && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 6 }}>
                            {Object.entries(q.options).map(([k, v]) => (
                              <div key={k} style={{ display: 'flex', gap: 8, fontSize: 12, color: '#444' }}>
                                <span style={{ fontWeight: 700, color: '#0f4c81', minWidth: 16 }}>{k}.</span>
                                <span>{v}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
