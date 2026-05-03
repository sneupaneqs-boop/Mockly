import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import { Icons } from '../components/Icons'
import { SECTION_A, SECTION_B, SECTION_C } from '../data/samplePMQuestions'

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean)

// ─── Helpers ─────────────────────────────────────────────────────────────────
function Field({ label, children, hint }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.06em' }}>
        {label}
      </label>
      {children}
      {hint && <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 3 }}>{hint}</div>}
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 10,
  fontSize: 13, color: 'var(--ink)', background: 'var(--bg)', outline: 'none',
  fontFamily: 'var(--font-sans)', boxSizing: 'border-box',
}

const textareaStyle = { ...inputStyle, resize: 'vertical', minHeight: 80, lineHeight: 1.6 }

function StatusMsg({ status }) {
  if (!status) return null
  return (
    <div style={{
      padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, marginBottom: 16,
      background: status.type === 'success' ? 'rgba(22,163,123,.1)' : 'rgba(244,63,118,.1)',
      color: status.type === 'success' ? 'var(--green)' : 'var(--rose)',
      border: `1px solid ${status.type === 'success' ? 'rgba(22,163,123,.3)' : 'rgba(244,63,118,.3)'}`,
    }}>
      {status.type === 'success' ? '✓ ' : '✗ '}{status.msg}
    </div>
  )
}

// ─── Section A Form ───────────────────────────────────────────────────────────
function SectionAForm({ subject }) {
  const blank = () => ({
    subject, section: 'A', topic_number: '', topic_name: '',
    question_text: '', answer_type: 'single',
    option_a: '', option_b: '', option_c: '', option_d: '', option_e: '',
    correct_answer: '', explanation: '', exam_session: '',
  })
  const [form, setForm] = useState(blank())
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function save(e) {
    e.preventDefault()
    setSaving(true); setStatus(null)
    const options = { A: form.option_a, B: form.option_b, C: form.option_c, D: form.option_d }
    if (form.option_e.trim()) options.E = form.option_e
    const row = {
      subject: form.subject,
      section: 'A',
      topic_number: parseInt(form.topic_number),
      topic_name: form.topic_name.trim(),
      question_text: form.question_text.trim(),
      answer_type: form.answer_type,
      options,
      correct_answer: form.correct_answer.trim().toUpperCase(),
      explanation: form.explanation.trim(),
      exam_session: form.exam_session.trim(),
    }
    const { error } = await supabase.from('questions').insert(row)
    if (error) setStatus({ type: 'error', msg: error.message })
    else { setStatus({ type: 'success', msg: 'Question saved!' }); setForm(blank()) }
    setSaving(false)
  }

  return (
    <form onSubmit={save}>
      <StatusMsg status={status}/>
      <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 12 }}>
        <Field label="Topic #">
          <input type="number" required style={inputStyle} value={form.topic_number} onChange={e => set('topic_number', e.target.value)} placeholder="e.g. 4"/>
        </Field>
        <Field label="Topic name">
          <input type="text" required style={inputStyle} value={form.topic_name} onChange={e => set('topic_name', e.target.value)} placeholder="e.g. Activity-Based Costing"/>
        </Field>
      </div>
      <Field label="Question text">
        <textarea required style={textareaStyle} value={form.question_text} onChange={e => set('question_text', e.target.value)} placeholder="Full question text including any scenario…"/>
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Option A"><input required style={inputStyle} value={form.option_a} onChange={e => set('option_a', e.target.value)}/></Field>
        <Field label="Option B"><input required style={inputStyle} value={form.option_b} onChange={e => set('option_b', e.target.value)}/></Field>
        <Field label="Option C"><input required style={inputStyle} value={form.option_c} onChange={e => set('option_c', e.target.value)}/></Field>
        <Field label="Option D"><input required style={inputStyle} value={form.option_d} onChange={e => set('option_d', e.target.value)}/></Field>
        <Field label="Option E (optional)"><input style={inputStyle} value={form.option_e} onChange={e => set('option_e', e.target.value)}/></Field>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <Field label="Correct answer" hint="e.g. B or B, D for multi">
          <input required style={inputStyle} value={form.correct_answer} onChange={e => set('correct_answer', e.target.value)} placeholder="B"/>
        </Field>
        <Field label="Answer type">
          <select style={inputStyle} value={form.answer_type} onChange={e => set('answer_type', e.target.value)}>
            <option value="single">Single choice</option>
            <option value="multi">Multi-select</option>
            <option value="numeric">Numeric</option>
          </select>
        </Field>
        <Field label="Exam session">
          <input style={inputStyle} value={form.exam_session} onChange={e => set('exam_session', e.target.value)} placeholder="Sep/Dec 2024"/>
        </Field>
      </div>
      <Field label="Explanation">
        <textarea style={textareaStyle} value={form.explanation} onChange={e => set('explanation', e.target.value)} placeholder="Why is this the correct answer? Show working if numerical."/>
      </Field>
      <button type="submit" className="btn btn-primary" disabled={saving} style={{ marginTop: 4 }}>
        <Icons.plus size={14}/> {saving ? 'Saving…' : 'Add Section A question'}
      </button>
    </form>
  )
}

// ─── Section B Form ───────────────────────────────────────────────────────────
function SectionBForm({ subject }) {
  const blankSub = () => ({ question_text: '', correct_answer: '', answer_type: 'single', explanation: '' })
  const blank = () => ({
    subject, topic_number: '', topic_name: '', scenario: '', exam_session: '',
    subs: [blankSub(), blankSub(), blankSub(), blankSub(), blankSub()],
  })
  const [form, setForm] = useState(blank())
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setSub = (i, k, v) => setForm(f => {
    const subs = [...f.subs]; subs[i] = { ...subs[i], [k]: v }; return { ...f, subs }
  })

  async function save(e) {
    e.preventDefault()
    setSaving(true); setStatus(null)
    const rows = form.subs.map((s, i) => ({
      subject: form.subject,
      section: 'B',
      topic_number: parseInt(form.topic_number),
      topic_name: form.topic_name.trim(),
      scenario: form.scenario.trim(),
      exam_session: form.exam_session.trim(),
      q_number: i + 1,
      question_text: s.question_text.trim(),
      answer_type: s.answer_type,
      correct_answer: s.correct_answer.trim().toUpperCase(),
      explanation: s.explanation.trim(),
      options: null,
    }))
    const { error } = await supabase.from('questions').insert(rows)
    if (error) setStatus({ type: 'error', msg: error.message })
    else { setStatus({ type: 'success', msg: 'MTQ group saved (5 questions)!' }); setForm(blank()) }
    setSaving(false)
  }

  return (
    <form onSubmit={save}>
      <StatusMsg status={status}/>
      <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr', gap: 12 }}>
        <Field label="Topic #">
          <input type="number" required style={inputStyle} value={form.topic_number} onChange={e => set('topic_number', e.target.value)} placeholder="e.g. 13"/>
        </Field>
        <Field label="Topic name">
          <input required style={inputStyle} value={form.topic_name} onChange={e => set('topic_name', e.target.value)} placeholder="e.g. Variance Analysis"/>
        </Field>
        <Field label="Exam session">
          <input style={inputStyle} value={form.exam_session} onChange={e => set('exam_session', e.target.value)} placeholder="Mar/Jun 2024"/>
        </Field>
      </div>
      <Field label="Shared scenario / case context">
        <textarea required style={{ ...textareaStyle, minHeight: 120 }} value={form.scenario} onChange={e => set('scenario', e.target.value)} placeholder="All 5 sub-questions share this scenario. Paste the full case here."/>
      </Field>

      <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--accent)', marginBottom: 12, marginTop: 8 }}>5 Sub-questions</div>
      {form.subs.map((s, i) => (
        <div key={i} style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 12, padding: 14, marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', marginBottom: 10 }}>Sub-question {String.fromCharCode(97 + i).toUpperCase()}</div>
          <Field label="Question text">
            <textarea required style={{ ...textareaStyle, minHeight: 60 }} value={s.question_text} onChange={e => setSub(i, 'question_text', e.target.value)}/>
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <Field label="Correct answer">
              <input required style={inputStyle} value={s.correct_answer} onChange={e => setSub(i, 'correct_answer', e.target.value)} placeholder="e.g. $24,000"/>
            </Field>
            <Field label="Answer type">
              <select style={inputStyle} value={s.answer_type} onChange={e => setSub(i, 'answer_type', e.target.value)}>
                <option value="single">Single choice</option>
                <option value="numeric">Numeric</option>
                <option value="text">Text (self-mark)</option>
              </select>
            </Field>
            <Field label="Explanation">
              <input style={inputStyle} value={s.explanation} onChange={e => setSub(i, 'explanation', e.target.value)} placeholder="Short explanation"/>
            </Field>
          </div>
        </div>
      ))}

      <button type="submit" className="btn btn-primary" disabled={saving}>
        <Icons.plus size={14}/> {saving ? 'Saving…' : 'Add Section B MTQ group (5 questions)'}
      </button>
    </form>
  )
}

// ─── Section C Form ───────────────────────────────────────────────────────────
function SectionCForm({ subject }) {
  const blankPart = () => ({ part: '', requirement: '', answer: '' })
  const blank = () => ({
    subject, topic_number: '', topic_name: '', scenario: '', exam_session: '',
    parts: [blankPart(), blankPart()],
  })
  const [form, setForm] = useState(blank())
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setPart = (i, k, v) => setForm(f => {
    const parts = [...f.parts]; parts[i] = { ...parts[i], [k]: v }; return { ...f, parts }
  })

  function addPart() { setForm(f => ({ ...f, parts: [...f.parts, blankPart()] })) }
  function removePart(i) { setForm(f => ({ ...f, parts: f.parts.filter((_, j) => j !== i) })) }

  async function save(e) {
    e.preventDefault()
    setSaving(true); setStatus(null)
    const row = {
      subject: form.subject,
      topic_number: parseInt(form.topic_number),
      topic_name: form.topic_name.trim(),
      scenario: form.scenario.trim(),
      exam_session: form.exam_session.trim(),
      parts: form.parts.map(p => ({
        part: p.part.trim(),
        requirement: p.requirement.trim(),
        answer: p.answer.trim(),
      })),
    }
    const { error } = await supabase.from('section_c').insert(row)
    if (error) setStatus({ type: 'error', msg: error.message })
    else { setStatus({ type: 'success', msg: 'Section C question saved!' }); setForm(blank()) }
    setSaving(false)
  }

  return (
    <form onSubmit={save}>
      <StatusMsg status={status}/>
      <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr', gap: 12 }}>
        <Field label="Topic #">
          <input type="number" required style={inputStyle} value={form.topic_number} onChange={e => set('topic_number', e.target.value)} placeholder="e.g. 7"/>
        </Field>
        <Field label="Topic name">
          <input required style={inputStyle} value={form.topic_name} onChange={e => set('topic_name', e.target.value)} placeholder="e.g. Relevant Costing"/>
        </Field>
        <Field label="Exam session">
          <input style={inputStyle} value={form.exam_session} onChange={e => set('exam_session', e.target.value)} placeholder="Sep/Dec 2024"/>
        </Field>
      </div>
      <Field label="Scenario / case context" hint="Full scenario visible to students during the exam.">
        <textarea required style={{ ...textareaStyle, minHeight: 160 }} value={form.scenario} onChange={e => set('scenario', e.target.value)} placeholder="Paste the full scenario / case text here…"/>
      </Field>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--accent)' }}>Parts ({form.parts.length})</div>
        <button type="button" className="btn btn-sm" onClick={addPart}><Icons.plus size={12}/> Add part</button>
      </div>

      {form.parts.map((p, i) => (
        <div key={i} style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 12, padding: 14, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)' }}>Part {i + 1}</div>
            {form.parts.length > 1 && (
              <button type="button" onClick={() => removePart(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rose)', fontSize: 12 }}>Remove</button>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 12 }}>
            <Field label="Label" hint="e.g. (a)">
              <input required style={inputStyle} value={p.part} onChange={e => setPart(i, 'part', e.target.value)} placeholder="(a)"/>
            </Field>
            <Field label="Requirement" hint="Include marks in brackets e.g. (10 marks)">
              <textarea required style={{ ...textareaStyle, minHeight: 56 }} value={p.requirement} onChange={e => setPart(i, 'requirement', e.target.value)} placeholder="Prepare a budgeted income statement for the period. (10 marks)"/>
            </Field>
          </div>
          <Field label="Model answer / examiner's answer">
            <textarea required style={{ ...textareaStyle, minHeight: 120 }} value={p.answer} onChange={e => setPart(i, 'answer', e.target.value)} placeholder="Full model answer shown to student after submission…"/>
          </Field>
        </div>
      ))}

      <button type="submit" className="btn btn-primary" disabled={saving}>
        <Icons.plus size={14}/> {saving ? 'Saving…' : 'Add Section C question'}
      </button>
    </form>
  )
}

// ─── Question list ────────────────────────────────────────────────────────────
function QuestionList({ subject }) {
  const [qsA, setQsA] = useState([])
  const [qsB, setQsB] = useState([])
  const [qsC, setQsC] = useState([])

  useEffect(() => {
    supabase.from('questions').select('id, topic_number, topic_name, question_text, section').eq('subject', subject).eq('section', 'A').order('topic_number')
      .then(({ data }) => setQsA(data || []))
    supabase.from('questions').select('id, topic_number, topic_name, q_number, section').eq('subject', subject).eq('section', 'B').order('topic_number')
      .then(({ data }) => setQsB(data || []))
    supabase.from('section_c').select('id, topic_number, topic_name, exam_session').eq('subject', subject).order('topic_number')
      .then(({ data }) => setQsC(data || []))
  }, [subject])

  async function deleteQ(table, id, refetch) {
    if (!window.confirm('Delete this question? This cannot be undone.')) return
    await supabase.from(table).delete().eq('id', id)
    refetch()
  }

  function reloadA() { supabase.from('questions').select('id, topic_number, topic_name, question_text, section').eq('subject', subject).eq('section', 'A').order('topic_number').then(({ data }) => setQsA(data || [])) }
  function reloadB() { supabase.from('questions').select('id, topic_number, topic_name, q_number, section').eq('subject', subject).eq('section', 'B').order('topic_number').then(({ data }) => setQsB(data || [])) }
  function reloadC() { supabase.from('section_c').select('id, topic_number, topic_name, exam_session').eq('subject', subject).order('topic_number').then(({ data }) => setQsC(data || [])) }

  const row = (label, count, color) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 10, marginBottom: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color }}>{label}</span>
      <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)' }}>{count}</span>
      <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{count === 1 ? 'question' : 'questions'}</span>
    </div>
  )

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
        {row('Section A', qsA.length, 'var(--accent)')}
        {row('Section B', qsB.length, 'var(--violet)')}
        {row('Section C', qsC.length, 'var(--green)')}
      </div>

      {[
        { label: 'Section A — MCQ', items: qsA, table: 'questions', reload: reloadA, renderItem: q => `[T${q.topic_number}] ${q.topic_name} — ${q.question_text?.slice(0, 80)}…` },
        { label: 'Section B — MTQ sub-questions', items: qsB, table: 'questions', reload: reloadB, renderItem: q => `[T${q.topic_number}] ${q.topic_name} — sub-q ${q.q_number}` },
        { label: 'Section C — Long form', items: qsC, table: 'section_c', reload: reloadC, renderItem: q => `[T${q.topic_number}] ${q.topic_name} — ${q.exam_session || ''}` },
      ].map(({ label, items, table, reload, renderItem }) => (
        <div key={label} style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--ink-3)', marginBottom: 8 }}>{label}</div>
          {items.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--ink-3)', padding: '12px 0', fontStyle: 'italic' }}>None yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {items.map(q => (
                <div key={q.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, fontSize: 12, color: 'var(--ink)' }}>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{renderItem(q)}</span>
                  <button onClick={() => deleteQ(table, q.id, reload)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rose)', fontSize: 11, flexShrink: 0, padding: '2px 6px' }}>Delete</button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Access manager ───────────────────────────────────────────────────────────
function AccessManager() {
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('PM')
  const [status, setStatus] = useState(null)
  const [list, setList] = useState([])

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from('user_access').select('user_id, subject')
    setList(data || [])
  }

  async function grant(e) {
    e.preventDefault(); setStatus(null)
    const { error } = await supabase.from('user_access').upsert(
      { user_id: email.trim(), subject },
      { onConflict: 'user_id,subject' }
    )
    if (error) setStatus({ type: 'error', msg: error.message })
    else { setStatus({ type: 'success', msg: `Access granted: ${email} → ${subject}` }); setEmail(''); load() }
  }

  async function revoke(uid, subj) {
    await supabase.from('user_access').delete().eq('user_id', uid).eq('subject', subj)
    load()
  }

  return (
    <div>
      <StatusMsg status={status}/>
      <form onSubmit={grant} style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        <input
          required value={email} onChange={e => setEmail(e.target.value)}
          placeholder="User UUID from Supabase Auth"
          style={{ ...inputStyle, flex: 2, minWidth: 200 }}
        />
        <select value={subject} onChange={e => setSubject(e.target.value)} style={{ ...inputStyle, flex: '0 0 200px' }}>
          <option value="PM">PM — Performance Management</option>
          <option value="TAX">TAX — Taxation</option>
        </select>
        <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>
          <Icons.plus size={14}/> Grant access
        </button>
      </form>
      <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 16 }}>Find UUIDs in Supabase Dashboard → Authentication → Users.</div>
      {list.map((r, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '8px 12px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, marginBottom: 4, fontSize: 13 }}>
          <span style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-2)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.user_id}</span>
          <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{r.subject}</span>
          <button onClick={() => revoke(r.user_id, r.subject)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rose)', fontSize: 12 }}>Revoke</button>
        </div>
      ))}
    </div>
  )
}

// ─── Seed Data Component ─────────────────────────────────────────────────────
function SeedData({ subject }) {
  const [counts, setCounts] = useState(null)
  const [importing, setImporting] = useState(false)
  const [done, setDone] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    async function check() {
      const [{ count: a }, { count: b }, { count: c }] = await Promise.all([
        supabase.from('questions').select('id', { count: 'exact', head: true }).eq('subject', subject).eq('section', 'A'),
        supabase.from('questions').select('id', { count: 'exact', head: true }).eq('subject', subject).eq('section', 'B'),
        supabase.from('section_c').select('id', { count: 'exact', head: true }).eq('subject', subject),
      ])
      setCounts({ a: a || 0, b: b || 0, c: c || 0 })
    }
    check()
  }, [subject, done])

  async function importSamples() {
    setImporting(true)
    let inserted = { a: 0, b: 0, c: 0 }
    try {
      // Insert Section A
      const aData = SECTION_A.filter(q => q.subject === subject)
      if (aData.length > 0) {
        const { data, error } = await supabase.from('questions').insert(
          aData.map(({ subject: s, section, topic_number, topic_name, exam_session, question_text, options, correct_answer, answer_type, explanation }) =>
            ({ subject: s, section, topic_number, topic_name, exam_session, question_text, options, correct_answer, answer_type, explanation })
          )
        ).select('id')
        if (!error) inserted.a = data?.length || 0
      }
      // Insert Section B
      const bData = SECTION_B.filter(q => q.subject === subject)
      if (bData.length > 0) {
        const { data, error } = await supabase.from('questions').insert(
          bData.map(({ subject: s, section, topic_number, topic_name, exam_session, scenario, q_number, question_text, options, correct_answer, answer_type, explanation }) =>
            ({ subject: s, section, topic_number, topic_name, exam_session, scenario, q_number, question_text, options, correct_answer, answer_type, explanation })
          )
        ).select('id')
        if (!error) inserted.b = data?.length || 0
      }
      // Insert Section C
      const cData = SECTION_C.filter(q => q.subject === subject)
      if (cData.length > 0) {
        const { data, error } = await supabase.from('section_c').insert(
          cData.map(({ subject: s, topic_number, topic_name, exam_session, scenario, parts }) =>
            ({ subject: s, topic_number, topic_name, exam_session, scenario, parts })
          )
        ).select('id')
        if (!error) inserted.c = data?.length || 0
      }
      setResult(inserted)
      setDone(d => !d)
    } catch (e) {
      alert('Import error: ' + e.message)
    }
    setImporting(false)
  }

  const sampleCounts = {
    a: SECTION_A.filter(q => q.subject === subject).length,
    b: SECTION_B.filter(q => q.subject === subject).length,
    c: SECTION_C.filter(q => q.subject === subject).length,
  }
  const alreadyHasData = counts && (counts.a + counts.b + counts.c) > 0

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Seed sample data</h3>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--ink-3)' }}>
          Import built-in ACCA {subject} sample questions to get started immediately.
        </p>
      </div>

      {/* Current DB status */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Section A in DB', val: counts?.a ?? '…', color: 'var(--accent)' },
          { label: 'Section B in DB', val: counts?.b ?? '…', color: 'var(--violet)' },
          { label: 'Section C in DB', val: counts?.c ?? '…', color: 'var(--green)' },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 14, padding: '14px 18px', textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Sample questions info */}
      <div style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 14, padding: '16px 20px', marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 12 }}>
          Sample question bank for {subject} — ready to import
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--ink)' }}>
            <span style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--accent-soft)', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700, color: 'var(--accent)', flexShrink: 0 }}>A</span>
            <span><strong>{sampleCounts.a}</strong> MCQ questions — topics: absorption costing, ABC, CVP, relevant costing, budgeting, variance analysis, balanced scorecard, divisional performance</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--ink)' }}>
            <span style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(139,92,246,.1)', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700, color: 'var(--violet)', flexShrink: 0 }}>B</span>
            <span><strong>{sampleCounts.b}</strong> MTQ sub-questions in <strong>3 groups</strong> — Variance Analysis (Delta Co), CVP Analysis (Gamma Co), Divisional Performance (Alpha Group)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--ink)' }}>
            <span style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(22,163,123,.1)', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700, color: 'var(--green)', flexShrink: 0 }}>C</span>
            <span><strong>{sampleCounts.c}</strong> long-form questions — Variance Analysis full workings (Omega Co) · Balanced Scorecard + Divisional Performance (Beta Healthcare)</span>
          </div>
        </div>
      </div>

      {alreadyHasData && (
        <div style={{ padding: '10px 14px', background: 'rgba(245,179,59,.1)', border: '1px solid rgba(245,179,59,.3)', borderRadius: 10, fontSize: 13, color: 'var(--ink)', marginBottom: 16 }}>
          ⚠ Your database already has {(counts?.a || 0) + (counts?.b || 0) + (counts?.c || 0)} questions. Importing will ADD to existing questions (no duplicates check). Only import once.
        </div>
      )}

      {result && (
        <div style={{ padding: '12px 16px', background: 'rgba(22,163,123,.1)', border: '1px solid rgba(22,163,123,.3)', borderRadius: 10, fontSize: 13, color: 'var(--green)', marginBottom: 16, fontWeight: 600 }}>
          ✓ Imported: {result.a} Section A · {result.b} Section B · {result.c} Section C questions
        </div>
      )}

      <button
        onClick={importSamples}
        disabled={importing}
        className="btn btn-primary"
        style={{ fontSize: 14, padding: '12px 28px' }}
      >
        <Icons.bolt size={14}/>
        {importing ? 'Importing…' : `Import ${sampleCounts.a + sampleCounts.b + sampleCounts.c} sample questions`}
      </button>
    </div>
  )
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────
const TABS = [
  { id: 'sectionA', label: 'Add — Section A', icon: <Icons.brain size={14}/> },
  { id: 'sectionB', label: 'Add — Section B', icon: <Icons.layers size={14}/> },
  { id: 'sectionC', label: 'Add — Section C', icon: <Icons.fileDoc size={14}/> },
  { id: 'questions', label: 'Question library', icon: <Icons.book size={14}/> },
  { id: 'access', label: 'Access control', icon: <Icons.settings size={14}/> },
  { id: 'seed', label: 'Seed data', icon: <Icons.bolt size={14}/> },
]

export default function Admin() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('sectionA')
  const [subject, setSubject] = useState('PM')

  const isAdmin = ADMIN_EMAILS.length === 0 || ADMIN_EMAILS.includes(user?.email)

  useEffect(() => {
    if (!isAdmin) navigate('/dashboard', { replace: true })
  }, [isAdmin])

  if (!isAdmin) return null

  return (
    <div className="page page-enter">
      <div className="section-head">
        <div>
          <h2 className="section-title">Admin <em>panel</em></h2>
          <p className="section-sub">Add questions, manage access, build your question bank.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select
            value={subject}
            onChange={e => setSubject(e.target.value)}
            style={{ ...inputStyle, width: 'auto', padding: '6px 12px' }}
          >
            <option value="PM">PM</option>
            <option value="TAX">TAX</option>
          </select>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, marginBottom: 24, overflowX: 'auto' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', fontSize: 13, fontWeight: tab === t.id ? 700 : 500,
              color: tab === t.id ? '#fff' : 'var(--ink-3)',
              background: tab === t.id ? 'var(--accent)' : 'transparent',
              border: 'none', cursor: 'pointer', borderRadius: 10, whiteSpace: 'nowrap',
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 18, padding: 24 }}>
        {tab === 'sectionA' && (
          <>
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Section A — MCQ Question</h3>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--ink-3)' }}>2 marks · single or multi-select · auto-graded</p>
            </div>
            <SectionAForm subject={subject}/>
          </>
        )}
        {tab === 'sectionB' && (
          <>
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Section B — MTQ Case Group</h3>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--ink-3)' }}>One scenario + 5 sub-questions · 2 marks each · auto-graded</p>
            </div>
            <SectionBForm subject={subject}/>
          </>
        )}
        {tab === 'sectionC' && (
          <>
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Section C — Long Form Question</h3>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--ink-3)' }}>20 marks · multi-part · written + spreadsheet answer · self-marked</p>
            </div>
            <SectionCForm subject={subject}/>
          </>
        )}
        {tab === 'questions' && <QuestionList subject={subject}/>}
        {tab === 'seed' && <SeedData subject={subject}/>}
        {tab === 'access' && (
          <>
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Access control</h3>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--ink-3)' }}>Grant or revoke subject access for students.</p>
            </div>
            <AccessManager/>
          </>
        )}
      </div>
    </div>
  )
}
