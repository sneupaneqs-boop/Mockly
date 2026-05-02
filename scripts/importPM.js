// scripts/importPM.js
// Run: node scripts/importPM.js
// Requires: SUPABASE_URL and SUPABASE_SERVICE_KEY in environment (service role key, not anon)

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_KEY

if (!url || !key) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.')
  process.exit(1)
}

const supabase = createClient(url, key)

function detectAnswerType(options, correctAnswer) {
  if (!options) return 'numeric'
  if (/^[A-E](,\s*[A-E])+$/i.test(correctAnswer)) return 'multi'
  if (/^[A-E]$/i.test(correctAnswer)) return 'single'
  return 'text'
}

const raw = readFileSync(join(__dirname, '../Kaplan.json'), 'utf8')
const data = JSON.parse(raw)

let insertedAB = 0
let insertedC = 0
let errors = 0

// -- Import MCQ/MTQ --
for (const group of data.mcq_mtq) {
  const {
    topic_number,
    topic_name,
    section,
    category = null,
    exam_session = null,
    scenario = null,
    questions = [],
  } = group

  for (const q of questions) {
    const answer_type = detectAnswerType(q.options ?? null, q.correct_answer ?? '')
    const row = {
      subject: 'PM',
      section,
      topic_number,
      topic_name,
      category,
      exam_session,
      scenario,
      q_number: q.q_number,
      question_text: q.question_text,
      options: q.options ?? null,
      correct_answer: q.correct_answer ?? null,
      answer_type,
      explanation: q.explanation ?? null,
    }

    const { error } = await supabase.from('questions').insert(row)
    if (error) {
      console.error(`Error inserting Q${q.q_number} (topic ${topic_number}):`, error.message)
      errors++
    } else {
      insertedAB++
      if (insertedAB % 50 === 0) console.log(`  Inserted ${insertedAB} MCQ/MTQ rows…`)
    }
  }
}

// -- Import Section C --
for (const item of data.section_c) {
  const row = {
    subject: 'PM',
    topic_number: item.topic_number,
    topic_name: item.topic_name,
    exam_session: item.exam_session ?? null,
    category: item.category ?? null,
    scenario: item.scenario ?? null,
    parts: item.parts ?? [],
  }

  const { error } = await supabase.from('section_c').insert(row)
  if (error) {
    console.error(`Error inserting Section C (topic ${item.topic_number}):`, error.message)
    errors++
  } else {
    insertedC++
  }
}

console.log(`\nDone. MCQ/MTQ: ${insertedAB} inserted, Section C: ${insertedC} inserted, Errors: ${errors}`)
