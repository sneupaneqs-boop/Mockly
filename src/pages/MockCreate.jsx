import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { Icons } from '../components/Icons'

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

  const [topicsA, setTopicsA] = useState([])
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

    let sectionBQs = []
    if (selB.size > 0) {
      const usedB = await getUsedIds('questions')
      const { data: allB } = await supabase
        .from('questions').select('id, topic_number, topic_name, section, q_number, scenario')
        .eq('subject', subject).eq('section', 'B').in('topic_number', [...selB])
        .order('q_number')

      const groups = new Map()
      for (const q of allB || []) {
        if (!groups.has(q.topic_number)) groups.set(q.topic_number, [])
        groups.get(q.topic_number).push(q)
      }

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
      sectionBQs = pickedGroups.flatMap(([, qs]) => qs.slice(0, 5))
    }

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

    const { data: session, error: sessErr } = await supabase
      .from('mock_sessions')
      .insert({ user_id: user.id, subject, chapters_selected: { A: [...selA], B: [...selB], C: [...selC] } })
      .select('id').single()

    if (sessErr) { alert('Error creating session: ' + sessErr.message); setGenerating(false); return }
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
    navigate(`/mock/${mockId}`)
  }

  const SECTIONS = [
    {
      key: 'A', label: 'Section A', badge: 'MCQ',
      desc: '15 questions × 2 marks = 30 marks',
      topics: topicsA, sel: selA,
      color: 'var(--accent)', colorSoft: 'var(--accent-soft)',
      icon: <Icons.brain size={18}/>,
    },
    {
      key: 'B', label: 'Section B', badge: 'MTQ',
      desc: '3 cases × 5 questions = 15 questions, 30 marks',
      topics: topicsB, sel: selB,
      color: 'var(--violet)', colorSoft: 'rgba(139,92,246,.08)',
      icon: <Icons.layers size={18}/>,
    },
    {
      key: 'C', label: 'Section C', badge: 'Long form',
      desc: '2 questions · self-marked · 20 marks each',
      topics: topicsC, sel: selC,
      color: 'var(--green)', colorSoft: 'rgba(22,163,123,.08)',
      icon: <Icons.fileDoc size={18}/>,
    },
  ]

  return (
    <div className="page page-enter">
      {/* Header */}
      <div className="section-head">
        <div>
          <h2 className="section-title">Create a <em>mock</em></h2>
          <p className="section-sub">Pick topics for each section — we'll pull fresh questions automatically.</p>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate(-1)}>
          <Icons.arrow size={14} style={{ transform: 'rotate(180deg)' }}/> Back
        </button>
      </div>

      {/* Section info cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
        {SECTIONS.map(s => (
          <div key={s.key} style={{ padding: '16px 18px', background: s.colorSoft, border: `1px solid ${s.color}30`, borderRadius: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: s.color + '22', display: 'grid', placeItems: 'center', flexShrink: 0, color: s.color }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{s.label} <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 6, background: s.color + '22', color: s.color, fontWeight: 700 }}>{s.badge}</span></div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 3 }}>{s.desc}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: s.color, marginTop: 4 }}>{s.sel.size} of {s.topics.length} topics selected</div>
            </div>
          </div>
        ))}
      </div>

      {warnings.map((w, i) => (
        <div key={i} style={{ background: 'rgba(245,179,59,.1)', border: '1px solid var(--gold)', borderRadius: 12, padding: '10px 14px', marginBottom: 10, fontSize: 13, color: 'var(--ink)', display: 'flex', gap: 8 }}>
          <Icons.flag size={14} style={{ color: 'var(--gold)', flexShrink: 0, marginTop: 1 }}/> {w}
        </div>
      ))}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--ink-3)', fontSize: 14 }}>Loading topics…</div>
      ) : (
        <>
          {SECTIONS.map(s => (
            <div key={s.key} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 18, marginBottom: 18, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: s.colorSoft }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ color: s.color }}>{s.icon}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{s.label} — {s.badge} Topics</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{s.desc}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.sel.size}/{s.topics.length}</span>
                  <button
                    onClick={() => toggleAll(s.key)}
                    className="btn btn-sm"
                    style={{ borderColor: s.color, color: s.color }}
                  >
                    {s.sel.size === s.topics.length ? 'Deselect all' : 'Select all'}
                  </button>
                </div>
              </div>
              <div style={{ padding: '14px 16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
                {s.topics.map(([num, name]) => {
                  const on = s.sel.has(num)
                  return (
                    <label key={num} style={{
                      display: 'flex', alignItems: 'center', gap: 9, padding: '8px 12px',
                      border: `1.5px solid ${on ? s.color : 'var(--line)'}`,
                      background: on ? s.colorSoft : 'var(--bg)',
                      cursor: 'pointer', borderRadius: 10, fontSize: 12.5, color: 'var(--ink)',
                      transition: 'all 0.12s',
                    }}>
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => toggle(s.key, num)}
                        style={{ accentColor: s.color, width: 14, height: 14, flexShrink: 0 }}
                      />
                      <span style={{ color: 'var(--ink-3)', minWidth: 22, fontSize: 11, fontFamily: 'var(--font-mono)' }}>{num}.</span>
                      <span style={{ flex: 1, lineHeight: 1.3 }}>{name}</span>
                    </label>
                  )
                })}
                {s.topics.length === 0 && (
                  <div style={{ padding: '12px 4px', fontSize: 12.5, color: 'var(--ink-3)', fontStyle: 'italic' }}>
                    No {s.label} topics in the database yet.
                  </div>
                )}
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', gap: 10, paddingTop: 8, flexWrap: 'wrap' }}>
            <button
              onClick={generate}
              disabled={generating || (selA.size === 0 && selB.size === 0 && selC.size === 0)}
              className="btn btn-primary"
              style={{ opacity: generating ? .7 : 1, cursor: generating ? 'wait' : 'pointer' }}
            >
              {generating
                ? <><Icons.bolt size={14}/> Generating…</>
                : <><Icons.bolt size={14}/> Generate mock exam</>}
            </button>
            <button
              className="btn btn-ghost"
              disabled={generating}
              onClick={() => {
                setSelA(new Set(topicsA.map(t => t[0])))
                setSelB(new Set(topicsB.map(t => t[0])))
                setSelC(new Set(topicsC.map(t => t[0])))
              }}
              title="Select ALL topics then generate a fully random mock"
            >
              <Icons.sparkle size={14}/> Random (all topics)
            </button>
            <button className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
          </div>
        </>
      )}
    </div>
  )
}
