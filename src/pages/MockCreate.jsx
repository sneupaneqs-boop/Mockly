import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { useTopicPerformance } from '../lib/useTopicPerformance'
import { Icons } from '../components/Icons'

// All 18 ACCA PM syllabus topics — always shown regardless of DB content
const PM_TOPICS = [
  { num: 1,  name: 'Costing concepts' },
  { num: 2,  name: 'Absorption & marginal costing' },
  { num: 3,  name: 'Throughput accounting' },
  { num: 4,  name: 'Activity-based costing' },
  { num: 5,  name: 'Target & life-cycle costing' },
  { num: 6,  name: 'CVP analysis' },
  { num: 7,  name: 'Relevant costing & limiting factors' },
  { num: 8,  name: 'Pricing decisions' },
  { num: 9,  name: 'Risk and uncertainty' },
  { num: 10, name: 'Budgeting techniques' },
  { num: 11, name: 'Quantitative analysis' },
  { num: 12, name: 'Standard costing' },
  { num: 13, name: 'Variance analysis' },
  { num: 14, name: 'Performance measurement systems' },
  { num: 15, name: 'Financial performance measures' },
  { num: 16, name: 'Non-financial measures' },
  { num: 17, name: 'Divisional performance' },
  { num: 18, name: 'Transfer pricing' },
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function MockCreate() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const subject = location.state?.subject || 'PM'

  // Single unified topic selection
  const [selected, setSelected] = useState(new Set())
  const [sections, setSections] = useState({ A: true, B: true, C: true })
  const [duration, setDuration] = useState('full') // 'quick'|'half'|'full'
  const [generating, setGenerating] = useState(false)
  const [warnings, setWarnings] = useState([])
  const [dbCounts, setDbCounts] = useState({ A: {}, B: {}, C: {} }) // topic_number → count
  const [loadingCounts, setLoadingCounts] = useState(true)

  const { topics: perfTopics } = useTopicPerformance(user?.id)

  // Fetch what's actually in DB per topic
  useEffect(() => {
    async function load() {
      const [{ data: qsAB }, { data: qsC }] = await Promise.all([
        supabase.from('questions').select('section, topic_number').eq('subject', subject),
        supabase.from('section_c').select('topic_number').eq('subject', subject),
      ])
      const countA = {}, countB = {}, countC = {}
      for (const r of qsAB || []) {
        if (r.section === 'A') countA[r.topic_number] = (countA[r.topic_number] || 0) + 1
        if (r.section === 'B') countB[r.topic_number] = (countB[r.topic_number] || 0) + 1
      }
      for (const r of qsC || []) countC[r.topic_number] = (countC[r.topic_number] || 0) + 1
      setDbCounts({ A: countA, B: countB, C: countC })
      setLoadingCounts(false)
    }
    load()
  }, [subject])

  // Duration auto-sets sections
  function setDurationMode(d) {
    setDuration(d)
    if (d === 'quick')  setSections({ A: true,  B: false, C: false })
    if (d === 'half')   setSections({ A: true,  B: true,  C: false })
    if (d === 'full')   setSections({ A: true,  B: true,  C: true  })
  }

  function toggleTopic(num) {
    setSelected(prev => {
      const n = new Set(prev)
      n.has(num) ? n.delete(num) : n.add(num)
      return n
    })
  }

  function selectAll() {
    if (selected.size === PM_TOPICS.length) setSelected(new Set())
    else setSelected(new Set(PM_TOPICS.map(t => t.num)))
  }

  // Total available questions from DB for selected topics & enabled sections
  const availability = useMemo(() => {
    const topicNums = [...selected]
    const aCount = topicNums.reduce((s, n) => s + (dbCounts.A[n] || 0), 0)
    const bGroups = new Set(topicNums.filter(n => dbCounts.B[n] > 0)).size
    const cCount = topicNums.reduce((s, n) => s + (dbCounts.C[n] || 0), 0)
    return { aCount, bGroups, cCount }
  }, [selected, dbCounts])

  const totalMarks = (sections.A ? 30 : 0) + (sections.B ? 30 : 0) + (sections.C ? 40 : 0)
  const durationMins = duration === 'quick' ? 60 : duration === 'half' ? 120 : 180

  // ── DB helpers (unchanged from original) ─────────────────────────────────
  async function getUsedIds(table) {
    const { data } = await supabase
      .from('used_questions').select('question_id')
      .eq('user_id', user.id).eq('question_table', table)
    return new Set((data || []).map(r => r.question_id))
  }
  async function resetUsedForTopics(table, ids) {
    if (!ids.length) return
    await supabase.from('used_questions').delete()
      .eq('user_id', user.id).eq('question_table', table).in('question_id', ids)
  }
  async function markUsed(table, ids) {
    if (!ids.length) return
    await supabase.from('used_questions').upsert(
      ids.map(id => ({ user_id: user.id, question_id: id, question_table: table })),
      { onConflict: 'user_id,question_id,question_table' }
    )
  }

  async function generate() {
    if (selected.size === 0) { alert('Select at least one topic.'); return }
    if (!sections.A && !sections.B && !sections.C) { alert('Enable at least one section.'); return }
    setGenerating(true)
    const warns = []
    const topicNums = [...selected]

    // ── Section A: 15 MCQ ──────────────────────────────────────────────────
    let sectionAQs = []
    if (sections.A) {
      const usedA = await getUsedIds('questions')
      const { data: allA } = await supabase
        .from('questions').select('id, topic_number, topic_name, section')
        .eq('subject', subject).eq('section', 'A').in('topic_number', topicNums)
      let pool = (allA || []).filter(q => !usedA.has(q.id))
      if (pool.length < 15) {
        warns.push(`Only ${pool.length} unused Section A questions — resetting used list.`)
        await resetUsedForTopics('questions', (allA || []).filter(q => usedA.has(q.id)).map(q => q.id))
        pool = allA || []
      }
      sectionAQs = shuffle(pool).slice(0, 15)
      if (sectionAQs.length === 0) warns.push('No Section A questions found for selected topics.')
    }

    // ── Section B: 3 MTQ groups × 5 questions ─────────────────────────────
    let sectionBQs = []
    if (sections.B) {
      const usedB = await getUsedIds('questions')
      const { data: allB } = await supabase
        .from('questions').select('id, topic_number, topic_name, section, q_number, scenario')
        .eq('subject', subject).eq('section', 'B').in('topic_number', topicNums).order('q_number')
      const groups = new Map()
      for (const q of allB || []) {
        if (!groups.has(q.topic_number)) groups.set(q.topic_number, [])
        groups.get(q.topic_number).push(q)
      }
      let availGroups = [...groups.entries()].filter(([, qs]) => !qs.every(q => usedB.has(q.id)))
      if (availGroups.length < 3) {
        warns.push(`Only ${availGroups.length} unused Section B groups — resetting.`)
        await resetUsedForTopics('questions', (allB || []).filter(q => usedB.has(q.id)).map(q => q.id))
        availGroups = [...groups.entries()]
      }
      const picked = shuffle(availGroups).slice(0, 3)
      sectionBQs = picked.flatMap(([, qs]) => qs.slice(0, 5))
      if (sectionBQs.length === 0) warns.push('No Section B questions found for selected topics.')
    }

    // ── Section C: 2 long-form ─────────────────────────────────────────────
    let sectionCQs = []
    if (sections.C) {
      const usedC = await getUsedIds('section_c')
      const { data: allC } = await supabase
        .from('section_c').select('id, topic_number, topic_name').eq('subject', subject).in('topic_number', topicNums)
      let pool = (allC || []).filter(q => !usedC.has(q.id))
      if (pool.length < 2) {
        warns.push(`Only ${pool.length} unused Section C questions — resetting.`)
        await resetUsedForTopics('section_c', (allC || []).filter(q => usedC.has(q.id)).map(q => q.id))
        pool = allC || []
      }
      sectionCQs = shuffle(pool).slice(0, 2)
      if (sectionCQs.length === 0) warns.push('No Section C questions found for selected topics.')
    }

    setWarnings(warns)

    const { data: session, error } = await supabase
      .from('mock_sessions')
      .insert({ user_id: user.id, subject, chapters_selected: { topics: topicNums, sections, durationMins } })
      .select('id').single()

    if (error) { alert('Error: ' + error.message); setGenerating(false); return }
    const mockId = session.id

    const rows = []
    let order = 0
    for (const q of sectionAQs) rows.push({ mock_id: mockId, question_id: q.id, question_table: 'questions', section: 'A', display_order: order++ })
    for (const q of sectionBQs) rows.push({ mock_id: mockId, question_id: q.id, question_table: 'questions', section: 'B', display_order: order++ })
    for (const q of sectionCQs) rows.push({ mock_id: mockId, question_id: q.id, question_table: 'section_c', section: 'C', display_order: order++ })

    if (rows.length > 0) await supabase.from('mock_questions').insert(rows)
    await markUsed('questions', [...sectionAQs, ...sectionBQs].map(q => q.id))
    await markUsed('section_c', sectionCQs.map(q => q.id))

    setGenerating(false)
    navigate(`/mock/${mockId}`, { state: { durationMins } })
  }

  const perfMap = useMemo(() => {
    const m = {}
    for (const t of perfTopics) m[t.num] = t
    return m
  }, [perfTopics])

  const SECTION_INFO = [
    {
      key: 'A',
      label: 'Section A — MCQ',
      detail: '15 questions · 2 marks each · 30 marks',
      time: '60 mins',
      color: '#5B5BFF',
    },
    {
      key: 'B',
      label: 'Section B — MTQ',
      detail: '3 case groups · 5 questions each · 30 marks',
      time: '36 mins',
      color: '#8B5CF6',
    },
    {
      key: 'C',
      label: 'Section C — Long form',
      detail: '2 questions · self-marked · 40 marks',
      time: '84 mins',
      color: '#16A37B',
    },
  ]

  const totalDbQs = Object.values(dbCounts.A).reduce((s, v) => s + v, 0)
    + Object.values(dbCounts.B).reduce((s, v) => s + v, 0)
    + Object.values(dbCounts.C).reduce((s, v) => s + v, 0)

  return (
    <div style={{ display: 'flex', gap: 0, height: 'calc(100vh - 58px)', overflow: 'hidden', background: 'var(--bg)' }}>

      {/* ── LEFT: Topic grid ─────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 32px 40px' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, margin: '0 0 6px', color: 'var(--ink)' }}>
            Build your <em>mock</em>
          </h2>
          <p style={{ margin: 0, fontSize: 13.5, color: 'var(--ink-3)' }}>
            Pick topics, sections and duration. We'll randomise questions you haven't seen recently.
          </p>
        </div>

        {/* Warnings */}
        {warnings.map((w, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, padding: '10px 14px', background: 'rgba(245,179,59,.1)', border: '1px solid rgba(245,179,59,.4)', borderRadius: 10, marginBottom: 12, fontSize: 13, color: 'var(--ink)' }}>
            <Icons.flag size={13} style={{ color: 'var(--gold)', flexShrink: 0, marginTop: 1 }}/> {w}
          </div>
        ))}

        {/* Topic controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>Topics</span>
            <span style={{ fontSize: 12.5, color: 'var(--ink-3)', marginLeft: 8 }}>
              {selected.size > 0 ? `${selected.size} selected` : "None selected · we'll suggest more if too few"}
            </span>
          </div>
          <button
            onClick={selectAll}
            className="btn btn-sm"
            style={{ fontSize: 12 }}
          >
            {selected.size === PM_TOPICS.length ? 'Deselect all' : 'Select all'}
          </button>
        </div>

        {totalDbQs === 0 && !loadingCounts && (
          <div style={{ background: 'rgba(244,63,118,.08)', border: '1px solid rgba(244,63,118,.25)', borderRadius: 12, padding: '14px 16px', marginBottom: 20, fontSize: 13, color: 'var(--ink)' }}>
            <strong>No questions in database yet.</strong> Go to{' '}
            <button onClick={() => navigate('/admin')} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 13, fontWeight: 700, padding: 0 }}>Admin → Add questions</button>
            {' '}to populate your question bank before generating a mock.
          </div>
        )}

        {/* 2-column topic grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {PM_TOPICS.map(topic => {
            const isSelected = selected.has(topic.num)
            const perf = perfMap[topic.num]
            const strength = perf?.strength ?? null
            const isWeak = strength !== null && strength < 60
            const hasQs = (dbCounts.A[topic.num] || 0) + (dbCounts.B[topic.num] || 0) + (dbCounts.C[topic.num] || 0) > 0

            return (
              <div
                key={topic.num}
                onClick={() => toggleTopic(topic.num)}
                style={{
                  padding: '14px 16px',
                  borderRadius: 14,
                  border: `${isSelected ? 2 : 1}px solid ${isSelected ? 'var(--accent)' : 'var(--line)'}`,
                  background: isSelected ? 'var(--accent-soft)' : 'var(--surface)',
                  cursor: 'pointer',
                  transition: 'all .12s',
                  position: 'relative',
                  userSelect: 'none',
                }}
              >
                {/* Top row: number + badges */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 9,
                    background: isSelected ? 'var(--accent)' : isWeak ? 'rgba(244,63,118,.12)' : 'var(--bg-2)',
                    display: 'grid', placeItems: 'center',
                    fontSize: 12, fontWeight: 700,
                    color: isSelected ? '#fff' : isWeak ? 'var(--rose)' : 'var(--ink-2)',
                    flexShrink: 0,
                  }}>
                    {topic.num}
                  </div>
                  <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                    {isSelected && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)', background: 'rgba(22,163,123,.12)', border: '1px solid rgba(22,163,123,.3)', padding: '2px 8px', borderRadius: 999 }}>
                        ✓ Selected
                      </span>
                    )}
                    {!isSelected && isWeak && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--rose)', background: 'rgba(244,63,118,.1)', border: '1px solid rgba(244,63,118,.25)', padding: '2px 8px', borderRadius: 999 }}>
                        Weak · {strength}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Topic name */}
                <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', marginBottom: 10, lineHeight: 1.3 }}>
                  {topic.name}
                </div>

                {/* Strength bar */}
                <div style={{ height: 3, borderRadius: 3, background: 'var(--line)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 3,
                    width: `${strength ?? 0}%`,
                    background: isSelected ? 'var(--accent)'
                      : isWeak ? 'var(--rose)'
                      : strength !== null ? 'var(--green)'
                      : 'var(--ink-3)',
                    transition: 'width .3s',
                  }}/>
                </div>

                {/* Question availability */}
                {!loadingCounts && (
                  <div style={{ marginTop: 6, fontSize: 10.5, color: hasQs ? 'var(--ink-3)' : 'rgba(244,63,118,.7)', fontWeight: hasQs ? 400 : 600 }}>
                    {hasQs
                      ? `${dbCounts.A[topic.num] || 0}A · ${dbCounts.B[topic.num] || 0}B · ${dbCounts.C[topic.num] || 0}C questions`
                      : 'No questions yet — add via Admin'}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── RIGHT: Config panel ──────────────────────────────────────── */}
      <div style={{
        width: 320, flexShrink: 0, borderLeft: '1px solid var(--line)',
        background: 'var(--surface)', overflowY: 'auto',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '28px 24px', flex: 1 }}>

          {/* Sections */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 14 }}>Sections</div>
            {SECTION_INFO.map(s => (
              <div
                key={s.key}
                onClick={() => setSections(prev => ({ ...prev, [s.key]: !prev[s.key] }))}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px',
                  borderRadius: 12, marginBottom: 8, cursor: 'pointer',
                  background: sections[s.key] ? `${s.color}10` : 'transparent',
                  border: `1px solid ${sections[s.key] ? s.color + '40' : 'var(--line)'}`,
                  transition: 'all .12s',
                }}
              >
                {/* Checkbox */}
                <div style={{
                  width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1,
                  background: sections[s.key] ? s.color : 'transparent',
                  border: `2px solid ${sections[s.key] ? s.color : 'var(--ink-3)'}`,
                  display: 'grid', placeItems: 'center',
                }}>
                  {sections[s.key] && <Icons.check size={11} sw={3} style={{ color: '#fff' }}/>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 2 }}>{s.label}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{s.detail}</div>
                  <div style={{ fontSize: 11, color: s.color, marginTop: 2, fontWeight: 600 }}>{s.time}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Duration */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 12 }}>Duration</div>
            <div style={{ display: 'flex', gap: 6, background: 'var(--bg)', borderRadius: 12, padding: 4 }}>
              {[
                { key: 'quick', label: 'Quick', sub: '1h' },
                { key: 'half',  label: 'Half',  sub: '2h' },
                { key: 'full',  label: 'Full',  sub: '3h' },
              ].map(d => (
                <button
                  key={d.key}
                  onClick={() => setDurationMode(d.key)}
                  style={{
                    flex: 1, padding: '8px 4px', borderRadius: 9, border: 'none', cursor: 'pointer',
                    background: duration === d.key ? 'var(--ink)' : 'transparent',
                    color: duration === d.key ? '#fff' : 'var(--ink-3)',
                    fontSize: 12, fontWeight: 700, lineHeight: 1.3,
                    transition: 'all .12s',
                  }}
                >
                  {d.label}<br/>
                  <span style={{ fontSize: 11, opacity: .7 }}>{d.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div style={{ background: 'var(--bg)', borderRadius: 12, padding: '14px 16px', marginBottom: 20, fontSize: 12.5 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: 'var(--ink-3)' }}>Topics selected</span>
              <span style={{ fontWeight: 700, color: selected.size > 0 ? 'var(--ink)' : 'var(--rose)' }}>{selected.size} / {PM_TOPICS.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: 'var(--ink-3)' }}>Total marks</span>
              <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{totalMarks}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--ink-3)' }}>Time allowed</span>
              <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{durationMins} mins</span>
            </div>
            {sections.A && availability.aCount < 15 && selected.size > 0 && (
              <div style={{ marginTop: 10, fontSize: 11.5, color: 'var(--rose)', fontWeight: 600 }}>
                ⚠ Only {availability.aCount} Section A Qs for selected topics (need 15)
              </div>
            )}
            {sections.B && availability.bGroups < 3 && selected.size > 0 && (
              <div style={{ marginTop: 6, fontSize: 11.5, color: 'var(--gold)', fontWeight: 600 }}>
                ⚠ Only {availability.bGroups} Section B groups (need 3)
              </div>
            )}
          </div>
        </div>

        {/* Start button — pinned to bottom */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--line)' }}>
          <button
            onClick={generate}
            disabled={generating || selected.size === 0 || (!sections.A && !sections.B && !sections.C)}
            style={{
              width: '100%', padding: '14px', borderRadius: 14, border: 'none', cursor: 'pointer',
              background: generating || selected.size === 0 ? 'var(--line)' : 'linear-gradient(135deg, var(--accent) 0%, var(--violet) 100%)',
              color: generating || selected.size === 0 ? 'var(--ink-3)' : '#fff',
              fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all .15s',
            }}
          >
            <Icons.bolt size={16}/>
            {generating ? 'Building mock…' : 'Start mock now'}
          </button>
          <button
            onClick={() => navigate(-1)}
            style={{ width: '100%', marginTop: 8, padding: '9px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--ink-3)' }}
          >
            ← Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
