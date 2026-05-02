import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'

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

  const [topicsA, setTopicsA] = useState([])   // [[num, name], ...]
  const [topicsB, setTopicsB] = useState([])
  const [topicsC, setTopicsC] = useState([])
  const [selA, setSelA] = useState(new Set())
  const [selB, setSelB] = useState(new Set())
  const [selC, setSelC] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [warnings, setWarnings] = useState([])

  useEffect(() => {
    async function load() {
      const [{ data: ab }, { data: c }] = await Promise.all([
        supabase.from('questions').select('section, topic_number, topic_name').eq('subject', subject),
        supabase.from('section_c').select('topic_number, topic_name').eq('subject', subject),
      ])
      const mapA = new Map(), mapB = new Map(), mapC = new Map()
      for (const r of ab || []) {
        if (r.section === 'A') mapA.set(r.topic_number, r.topic_name)
        if (r.section === 'B') mapB.set(r.topic_number, r.topic_name)
      }
      for (const r of c || []) mapC.set(r.topic_number, r.topic_name)

      setTopicsA([...mapA.entries()].sort((a, b) => a[0] - b[0]))
      setTopicsB([...mapB.entries()].sort((a, b) => a[0] - b[0]))
      setTopicsC([...mapC.entries()].sort((a, b) => a[0] - b[0]))
      setLoading(false)
    }
    load()
  }, [subject])

  function toggleAll(section) {
    const map = { A: [topicsA, selA, setSelA], B: [topicsB, selB, setSelB], C: [topicsC, selC, setSelC] }
    const [topics, sel, setSel] = map[section]
    if (sel.size === topics.length) setSel(new Set())
    else setSel(new Set(topics.map(t => t[0])))
  }

  function toggle(section, num) {
    const map = { A: [selA, setSelA], B: [selB, setSelB], C: [selC, setSelC] }
    const [sel, setSel] = map[section]
    const next = new Set(sel)
    next.has(num) ? next.delete(num) : next.add(num)
    setSel(next)
  }

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
    const hasSelection = selA.size > 0 || selB.size > 0 || selC.size > 0
    if (!hasSelection) { alert('Select at least one topic.'); return }
    setGenerating(true)
    const warns = []

    // ── Section A: exactly 15 MCQs ──
    let sectionAQs = []
    if (selA.size > 0) {
      const usedA = await getUsedIds('questions')
      const { data: allA } = await supabase
        .from('questions').select('id, topic_number, topic_name, section')
        .eq('subject', subject).eq('section', 'A').in('topic_number', [...selA])

      let pool = (allA || []).filter(q => !usedA.has(q.id))

      if (pool.length < 15) {
        warns.push(`Not enough unused Section A questions (found ${pool.length}). Resetting used questions for selected topics.`)
        const toReset = (allA || []).filter(q => usedA.has(q.id)).map(q => q.id)
        await resetUsedForTopics('questions', toReset)
        pool = allA || []
      }

      sectionAQs = shuffle(pool).slice(0, 15)
    }

    // ── Section B: exactly 3 complete MTQ groups (5 sub-questions each = 15 total) ──
    let sectionBQs = []
    if (selB.size > 0) {
      const usedB = await getUsedIds('questions')
      const { data: allB } = await supabase
        .from('questions').select('id, topic_number, topic_name, section, q_number, scenario')
        .eq('subject', subject).eq('section', 'B').in('topic_number', [...selB])
        .order('q_number')

      // Group questions by topic_number (each MTQ group = one case)
      const groups = new Map()
      for (const q of allB || []) {
        if (!groups.has(q.topic_number)) groups.set(q.topic_number, [])
        groups.get(q.topic_number).push(q)
      }

      // A group is "used" only if ALL its questions have been used
      const availGroups = [...groups.entries()].filter(
        ([, qs]) => !qs.every(q => usedB.has(q.id))
      )

      let pickedGroups
      if (availGroups.length >= 3) {
        pickedGroups = shuffle(availGroups).slice(0, 3)
      } else {
        warns.push(`Not enough unused Section B MTQ groups (found ${availGroups.length}). Resetting.`)
        const toReset = (allB || []).filter(q => usedB.has(q.id)).map(q => q.id)
        await resetUsedForTopics('questions', toReset)
        pickedGroups = shuffle([...groups.entries()]).slice(0, 3)
      }

      // Each group should have exactly 5 questions; take first 5 if more
      sectionBQs = pickedGroups.flatMap(([, qs]) => qs.slice(0, 5))
    }

    // ── Section C: exactly 2 questions ──
    let sectionCQs = []
    if (selC.size > 0) {
      const usedC = await getUsedIds('section_c')
      const { data: allC } = await supabase
        .from('section_c').select('id, topic_number, topic_name')
        .eq('subject', subject).in('topic_number', [...selC])

      let pool = (allC || []).filter(q => !usedC.has(q.id))

      if (pool.length < 2) {
        warns.push(`Not enough unused Section C questions (found ${pool.length}). Resetting.`)
        const toReset = (allC || []).filter(q => usedC.has(q.id)).map(q => q.id)
        await resetUsedForTopics('section_c', toReset)
        pool = allC || []
      }

      sectionCQs = shuffle(pool).slice(0, 2)
    }

    setWarnings(warns)

    // ── Create mock session ──
    const { data: session, error: sessErr } = await supabase
      .from('mock_sessions')
      .insert({ user_id: user.id, subject, chapters_selected: { A: [...selA], B: [...selB], C: [...selC] } })
      .select('id').single()

    if (sessErr) { alert('Error creating session: ' + sessErr.message); setGenerating(false); return }
    const mockId = session.id

    // ── Insert mock_questions rows ──
    const rows = []
    let order = 0

    for (const q of sectionAQs) {
      rows.push({ mock_id: mockId, question_id: q.id, question_table: 'questions', section: 'A', display_order: order++ })
    }
    for (const q of sectionBQs) {
      rows.push({ mock_id: mockId, question_id: q.id, question_table: 'questions', section: 'B', display_order: order++ })
    }
    for (const q of sectionCQs) {
      rows.push({ mock_id: mockId, question_id: q.id, question_table: 'section_c', section: 'C', display_order: order++ })
    }

    if (rows.length > 0) await supabase.from('mock_questions').insert(rows)

    // ── Mark used ──
    await markUsed('questions', [...sectionAQs, ...sectionBQs].map(q => q.id))
    await markUsed('section_c', sectionCQs.map(q => q.id))

    setGenerating(false)
    navigate(`/mock/${mockId}`)
  }

  const SectionPicker = ({ label, desc, topics, sel, section, color }) => (
    <div style={{ background: '#fff', border: '1px solid #d8e2ee', borderRadius: 4, marginBottom: 16, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: color, borderBottom: '1px solid #d8e2ee' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1a2b4a' }}>{label}</div>
          <div style={{ fontSize: 11, color: '#5a7a9a', marginTop: 2 }}>{desc}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#0f4c81' }}>
            {sel.size}/{topics.length} selected
          </span>
          <button
            onClick={() => toggleAll(section)}
            style={{ fontSize: 11, color: '#0f4c81', background: 'none', border: '1px solid #0f4c81', padding: '2px 8px', cursor: 'pointer', borderRadius: 2 }}
          >
            {sel.size === topics.length ? 'Deselect all' : 'Select all'}
          </button>
        </div>
      </div>
      {/* Topics grid */}
      <div style={{ padding: '10px 12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 4 }}>
        {topics.map(([num, name]) => (
          <label
            key={num}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
              border: `1px solid ${sel.has(num) ? '#0f4c81' : '#d8e2ee'}`,
              background: sel.has(num) ? '#eaf3ff' : '#fafcff',
              cursor: 'pointer', borderRadius: 2, fontSize: 12, color: '#1a2b4a',
              transition: 'all 0.1s',
            }}
          >
            <input
              type="checkbox"
              checked={sel.has(num)}
              onChange={() => toggle(section, num)}
              style={{ accentColor: '#0f4c81', width: 13, height: 13 }}
            />
            <span style={{ color: '#9ab3cc', minWidth: 22, fontSize: 11 }}>{num}.</span>
            <span style={{ flex: 1 }}>{name}</span>
          </label>
        ))}
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', fontFamily: 'Arial, Helvetica, sans-serif' }}>
      {/* Top bar */}
      <div style={{ height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', background: '#1a2b4a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate(-1)} style={{ color: '#7ab3d4', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>← Back</button>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>Mockly</span>
          <span style={{ color: '#7a9cbd', fontSize: 12 }}>|</span>
          <span style={{ color: '#c8d8e8', fontSize: 13 }}>Create Mock — {subject}</span>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px' }}>
        {/* Info banner */}
        <div style={{ background: '#e8f0f8', border: '1px solid #b8d0e8', borderRadius: 4, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 20, fontSize: 13 }}>
          {[
            { s: 'A', label: 'Section A — MCQ', detail: '15 questions × 2 marks = 30 marks' },
            { s: 'B', label: 'Section B — MTQ', detail: '3 cases × 5 questions = 15 questions, 30 marks' },
            { s: 'C', label: 'Section C — Long Form', detail: '2 questions, self-marked, 20 marks each' },
          ].map(({ s, label, detail }) => (
            <div key={s} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontWeight: 700, color: '#0f4c81', fontSize: 14 }}>{label}</div>
              <div style={{ color: '#5a7a9a', fontSize: 12, marginTop: 2 }}>{detail}</div>
            </div>
          ))}
        </div>

        {warnings.map((w, i) => (
          <div key={i} style={{ background: '#fff8e6', border: '1px solid #f5c842', borderRadius: 4, padding: '10px 14px', marginBottom: 10, fontSize: 13, color: '#7a5a00' }}>
            ⚠ {w}
          </div>
        ))}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#5a7a9a' }}>Loading topics…</div>
        ) : (
          <>
            <SectionPicker label="Section A — MCQ Topics" desc="Select topics to draw 15 random MCQ questions from" topics={topicsA} sel={selA} section="A" color="#f0f6ff" />
            <SectionPicker label="Section B — MTQ Case Topics" desc="Select topics to draw 3 complete case groups (5 sub-questions each)" topics={topicsB} sel={selB} section="B" color="#f5f0ff" />
            <SectionPicker label="Section C — Long Form Topics" desc="Select topics to draw 2 long-form questions" topics={topicsC} sel={selC} section="C" color="#f0fff5" />

            <div style={{ display: 'flex', gap: 10, paddingTop: 16, borderTop: '1px solid #d8e2ee' }}>
              <button
                onClick={generate}
                disabled={generating || (selA.size === 0 && selB.size === 0 && selC.size === 0)}
                style={{
                  padding: '10px 28px', fontSize: 14, fontWeight: 700,
                  background: '#0f4c81', color: '#fff', border: 'none',
                  cursor: generating ? 'wait' : 'pointer', borderRadius: 3,
                  opacity: generating ? 0.7 : 1,
                }}
              >
                {generating ? '⏳ Generating…' : '▶ Generate Mock Exam'}
              </button>
              <button
                onClick={() => navigate(-1)}
                style={{ padding: '10px 18px', fontSize: 13, color: '#5a7a9a', background: '#fff', border: '1px solid #d8e2ee', cursor: 'pointer', borderRadius: 3 }}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
