import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { normalizeQuestion, markAnswer } from './questionUtils'

/**
 * Returns real topic performance for a user, derived from DB questions
 * and their answered mock_questions in completed sessions.
 *
 * Each topic: { num, name, total, correct, strength }
 * strength = accuracy % if answered ≥ 1, else null (never attempted)
 */
export function useTopicPerformance(userId) {
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) { setLoading(false); return }

    async function load() {
      // 1. All distinct topics in the questions DB
      const { data: topicRows } = await supabase
        .from('questions')
        .select('topic_number, topic_name')
        .eq('subject', 'PM')

      const topicMap = new Map()
      for (const r of topicRows || []) {
        const key = r.topic_number
        if (!topicMap.has(key)) {
          topicMap.set(key, { num: key, name: r.topic_name, total: 0, correct: 0 })
        }
      }

      // 2. User's completed sessions
      const { data: sessions } = await supabase
        .from('mock_sessions')
        .select('id')
        .eq('user_id', userId)
        .not('completed_at', 'is', null)

      if (sessions?.length > 0) {
        const sessionIds = sessions.map(s => s.id)

        const { data: mqs } = await supabase
          .from('mock_questions')
          .select('question_id, user_answer')
          .in('mock_id', sessionIds)
          .eq('question_table', 'questions')
          .not('user_answer', 'is', null)

        if (mqs?.length > 0) {
          const qIds = [...new Set(mqs.map(m => m.question_id))]
          const { data: qs } = await supabase
            .from('questions')
            .select('id, topic_number, topic_name, correct_answer, answer_type, options, question_text')
            .in('id', qIds)

          const qById = Object.fromEntries((qs || []).map(q => [q.id, q]))

          for (const mq of mqs) {
            const q = qById[mq.question_id]
            if (!q) continue
            const topic = topicMap.get(q.topic_number)
            if (!topic) continue
            topic.total++
            const { correct } = markAnswer(normalizeQuestion(q), mq.user_answer)
            if (correct === true) topic.correct++
          }
        }
      }

      const result = [...topicMap.values()]
        .map(t => ({
          ...t,
          strength: t.total > 0 ? Math.round(t.correct / t.total * 100) : null,
        }))
        .sort((a, b) => a.num - b.num)

      setTopics(result)
      setLoading(false)
    }

    load()
  }, [userId])

  return { topics, loading }
}

/**
 * Calculate the current daily streak from an array of mock sessions.
 * A streak day counts if the user completed at least one mock on that day.
 */
export function calcStreak(sessions) {
  const completed = (sessions || []).filter(s => s.completed_at)
  if (completed.length === 0) return 0

  const dates = new Set(completed.map(s => s.completed_at.slice(0, 10)))
  let streak = 0
  const d = new Date()

  // Accept today OR yesterday as the streak start (don't break on off-day not yet ended)
  const todayIso = d.toISOString().slice(0, 10)
  const yest = new Date(d); yest.setDate(yest.getDate() - 1)
  const yestIso = yest.toISOString().slice(0, 10)

  if (!dates.has(todayIso) && !dates.has(yestIso)) return 0

  // Walk backwards
  const start = dates.has(todayIso) ? new Date(d) : new Date(yest)
  const cur = new Date(start)
  while (true) {
    const iso = cur.toISOString().slice(0, 10)
    if (!dates.has(iso)) break
    streak++
    cur.setDate(cur.getDate() - 1)
  }
  return streak
}

/**
 * Adapt a DB `questions` row into the format PracticeCard expects.
 */
export function adaptDbQuestion(dbQ) {
  const norm = normalizeQuestion(dbQ)
  const isMulti = norm.answer_type === 'multi'
  let correct = norm.correct_answer || ''
  if (isMulti && typeof correct === 'string') {
    correct = correct.split(',').map(s => s.trim()).filter(Boolean)
  }
  return {
    id: dbQ.id,
    topic: dbQ.topic_name || '',
    topicNum: dbQ.topic_number,
    paper: dbQ.subject || 'PM',
    session: dbQ.exam_session || '',
    type: isMulti ? 'multi' : 'single',
    difficulty: 'Medium',
    marks: 2,
    prompt: norm.question_text || '',
    options: norm.options || {},
    correct,
    explanation: dbQ.explanation || '',
    calc: dbQ.working || '',
    syllabus: `${dbQ.subject || 'PM'} • ${dbQ.topic_name || ''}`,
  }
}
