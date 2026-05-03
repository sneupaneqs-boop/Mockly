import React, { useState, useEffect, useMemo } from 'react'
import { Icons } from './Icons'

function Confetti({ trigger }) {
  const [pieces, setPieces] = useState([])
  useEffect(() => {
    if (!trigger) return
    const colors = ['#5B5BFF','#22D3EE','#FF7A45','#F5B33B','#16A37B','#8B5CF6','#F43F76']
    const arr = Array.from({ length: 60 }, (_, i) => ({
      id: trigger + '-' + i,
      left: Math.random() * 100,
      delay: Math.random() * 0.4,
      dur: 1.4 + Math.random() * 1.4,
      color: colors[i % colors.length],
      rot: Math.random() * 360,
      w: 6 + Math.random() * 6,
    }))
    setPieces(arr)
    const t = setTimeout(() => setPieces([]), 3500)
    return () => clearTimeout(t)
  }, [trigger])

  if (!pieces.length) return null
  return (
    <div className="confetti">
      {pieces.map(p => (
        <span key={p.id} style={{
          left: p.left + '%', background: p.color,
          width: p.w + 'px', height: (p.w * 1.6) + 'px',
          animationDuration: p.dur + 's', animationDelay: p.delay + 's',
          transform: `rotate(${p.rot}deg)`, '--d': p.dur + 's',
        }} />
      ))}
    </div>
  )
}

export default function PracticeCard({ q, idx, total, onNext, onAnswer }) {
  const [picked, setPicked] = useState(q.type === 'multi' ? [] : null)
  const [submitted, setSubmitted] = useState(false)
  const [confetti, setConfetti] = useState(0)

  useEffect(() => {
    setPicked(q.type === 'multi' ? [] : null)
    setSubmitted(false)
  }, [q.id])

  const isMulti = q.type === 'multi'
  const required = isMulti ? (Array.isArray(q.correct) ? q.correct.length : 2) : 1

  function pick(k) {
    if (submitted) return
    if (isMulti) {
      setPicked(prev => prev.includes(k) ? prev.filter(x => x !== k) : (prev.length < required ? [...prev, k] : prev))
    } else {
      setPicked(k)
    }
  }

  const correct = useMemo(() => {
    if (!submitted) return null
    if (isMulti) {
      return [...picked].sort().join(',') === [...q.correct].sort().join(',')
    }
    return picked === q.correct
  }, [submitted, picked, q])

  function submit() {
    if (isMulti ? picked.length !== required : !picked) return
    setSubmitted(true)
    const isRight = isMulti
      ? [...picked].sort().join(',') === [...q.correct].sort().join(',')
      : picked === q.correct
    if (isRight) setConfetti(Date.now())
    onAnswer?.({ qid: q.id, topic: q.topic, correct: isRight, picked })
  }

  function statusOf(k) {
    if (!submitted) return picked === k || (isMulti && picked.includes(k)) ? 'selected' : ''
    const isCorrectAnswer = isMulti ? q.correct.includes(k) : k === q.correct
    const isPicked = isMulti ? picked.includes(k) : picked === k
    if (isCorrectAnswer) return 'correct locked'
    if (isPicked && !isCorrectAnswer) return 'wrong locked'
    return 'locked faded'
  }

  return (
    <div className="q-card page-enter">
      <Confetti trigger={confetti}/>
      <div className="q-tape"/>

      <div className="q-meta">
        <span className="pill violet">{q.paper}</span>
        <span className="pill">{q.topic}</span>
        <span className="dot-sep"/>
        <span>{q.session}</span>
        <span className="dot-sep"/>
        <span className={`pill ${q.difficulty === 'Hard' ? 'warm' : q.difficulty === 'Easy' ? 'green' : 'gold'}`}>
          {q.difficulty}
        </span>
        <span style={{ marginLeft: 'auto', color: 'var(--ink-3)', textTransform: 'none', letterSpacing: 0, fontWeight: 500 }}>
          Question {idx + 1} of {total}
        </span>
      </div>

      <p className="q-prompt">{q.prompt}</p>
      {isMulti && !submitted && (
        <div style={{ fontSize: 12, color: 'var(--accent-ink)', background: 'var(--accent-soft)', display: 'inline-block', padding: '4px 10px', borderRadius: 8, marginTop: 10, fontWeight: 600 }}>
          ⌃ Select {required}
        </div>
      )}

      <div className="options">
        {Object.entries(q.options).map(([k, v]) => (
          <div key={k} className={`opt ${statusOf(k)}`} onClick={() => pick(k)}>
            <span className="key">{k}</span>
            <span className="label">{v}</span>
            <span className="mark">
              {submitted && (q.correct === k || (isMulti && q.correct.includes(k)))
                ? <Icons.check size={14} sw={3}/>
                : (submitted && (isMulti ? picked.includes(k) : picked === k))
                  ? <Icons.x size={14} sw={3}/> : null}
            </span>
          </div>
        ))}
      </div>

      {submitted && (
        <div className={`explain ${correct ? 'correct' : 'wrong'}`}>
          <div className="ribbon">
            {correct ? <Icons.check size={16} sw={3}/> : <Icons.x size={16} sw={3}/>}
            <b>{correct ? 'Correct! Well done.' : 'Not quite — see why below.'}</b>
            <span className="conf">+{correct ? q.marks * 5 : 1} XP</span>
          </div>
          <div className="body">
            <h5>Explanation</h5>
            <div>{q.explanation}</div>
            {q.calc && (
              <>
                <h5 style={{ marginTop: 12 }}>Working</h5>
                <div className="calc">{q.calc}</div>
              </>
            )}
            <a className="syllabus"><Icons.book size={12}/> {q.syllabus}</a>
          </div>
        </div>
      )}

      <div className="q-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${((idx + (submitted ? 1 : 0)) / total) * 100}%` }}/>
          </div>
          <span style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>{idx + 1}/{total}</span>
        </div>
        {!submitted ? (
          <button className="btn btn-primary" onClick={submit}
            disabled={isMulti ? picked.length !== required : !picked}
            style={{ opacity: (isMulti ? picked.length !== required : !picked) ? .5 : 1 }}>
            Check answer <Icons.check size={14} sw={3}/>
          </button>
        ) : (
          <button className="btn btn-primary" onClick={onNext}>
            Next question <Icons.arrow size={14}/>
          </button>
        )}
      </div>
    </div>
  )
}
