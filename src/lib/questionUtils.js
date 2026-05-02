/**
 * Normalizes a question object so rendering is clean and correct.
 * Handles:
 *   - Questions with 5-9 options (multi-select with all options shown)
 *   - Text-style correct_answers → parsed to letter codes
 *   - Numeric questions without options
 *   - Cleaning stray whitespace
 */

const ORDINALS = {
  first: 0, second: 1, third: 2, fourth: 3, fifth: 4,
  sixth: 5, seventh: 6, eighth: 7, ninth: 8, tenth: 9,
  '1st': 0, '2nd': 1, '3rd': 2, '4th': 3, '5th': 4,
}

/**
 * Try to parse a textual correct_answer like "The second and third statements are correct"
 * into letter codes based on the options keys.
 */
export function parseTextualAnswer(correctAnswer, optionKeys) {
  if (!correctAnswer || !optionKeys) return null
  const ca = correctAnswer.toLowerCase().trim()

  // Already a clean single letter
  if (/^[a-e]$/.test(ca)) return ca.toUpperCase()

  // Already a clean multi: "B, E" or "A, C, D"
  const multiMatch = correctAnswer.trim().match(/^([A-E])(?:,\s*([A-E]))+$/)
  if (multiMatch) return correctAnswer.trim().toUpperCase()

  // e.g. "B, E" with space around
  const cleanMulti = correctAnswer.trim().match(/^([A-E])((?:,\s*[A-E])+)$/)
  if (cleanMulti) return correctAnswer.trim().toUpperCase()

  // Try to find ordinals in the text
  const found = []
  for (const [word, idx] of Object.entries(ORDINALS)) {
    const re = new RegExp(`\\b${word}\\b`, 'i')
    if (re.test(ca) && idx < optionKeys.length) {
      found.push({ idx, letter: optionKeys[idx] })
    }
  }
  if (found.length > 0) {
    const unique = [...new Set(found.map(f => f.letter))].sort()
    return unique.join(', ')
  }

  // Look for standalone letter mentions like "options B and D"
  const letterMentions = [...ca.matchAll(/\b([a-e])\b/g)].map(m => m[1].toUpperCase())
  if (letterMentions.length > 0 && letterMentions.length <= 4) {
    const valid = letterMentions.filter(l => optionKeys.includes(l))
    if (valid.length > 0) return [...new Set(valid)].sort().join(', ')
  }

  return null // cannot parse — mark as 'text'
}

/**
 * Detect how many options to select from the question text.
 * "Which TWO of the following" → 2, "Which THREE" → 3, etc.
 */
export function detectMaxSelect(questionText) {
  const m = questionText.match(/which\s+(one|two|three|four|1|2|3|4)\b/i)
  if (!m) return null
  const w = m[1].toLowerCase()
  const map = { one: 1, '1': 1, two: 2, '2': 2, three: 3, '3': 3, four: 4, '4': 4 }
  return map[w] || null
}

/**
 * Fully normalizes a question row from the database.
 * Returns { ...q, answer_type, correct_answer, options, _parsedAnswer }
 */
export function normalizeQuestion(q) {
  if (!q) return q
  const optKeys = q.options ? Object.keys(q.options) : []
  let { answer_type, correct_answer, options } = q

  // Re-detect answer_type based on actual data
  if (!options || optKeys.length === 0) {
    answer_type = 'numeric'
  } else {
    const ca = (correct_answer || '').trim()
    // Clean multi like "B, E" or "A, C"
    if (/^[A-E](,\s*[A-E])+$/.test(ca)) {
      answer_type = 'multi'
    } else if (/^[A-E]$/.test(ca)) {
      answer_type = optKeys.length > 4 ? 'multi' : 'single'
    } else {
      // Textual answer — try to parse it
      const parsed = parseTextualAnswer(ca, optKeys)
      if (parsed) {
        correct_answer = parsed
        answer_type = parsed.includes(',') ? 'multi' : 'single'
      } else {
        // Truly descriptive — check if it's numeric by looking at question text
        const numericPattern = /\$[\d,]+|calculate|how many|how much|what is the.*\?/i
        answer_type = numericPattern.test(q.question_text) && optKeys.length === 0 ? 'numeric' : 'text'
      }
    }
  }

  // For multi questions, detect max selections from question text
  let maxSelect = null
  if (answer_type === 'multi') {
    maxSelect = detectMaxSelect(q.question_text)
    if (!maxSelect) {
      // infer from correct_answer
      const parts = (correct_answer || '').split(',').filter(Boolean)
      maxSelect = parts.length || 2
    }
  }

  return { ...q, answer_type, correct_answer, options, maxSelect }
}

/**
 * Check if a Section C part requires a spreadsheet answer.
 */
export function requiresSpreadsheet(requirement) {
  if (!requirement) return false
  const r = requirement.toLowerCase()
  return (
    r.includes('spreadsheet') ||
    r.includes('prepare a') ||
    r.includes('produce a') ||
    (r.includes('calculate') && (r.includes('statement') || r.includes('budget') || r.includes('table') || r.includes('reconcil') || r.includes('forecast'))) ||
    r.includes('profit statement') ||
    r.includes('income statement') ||
    r.includes('cash flow') ||
    r.includes('variance analysis') ||
    r.includes('absorption costing') ||
    r.includes('marginal costing')
  )
}

/**
 * Mark a Section A/B answer: returns {correct: bool, marks: number}
 */
export function markAnswer(q, userAnswer) {
  if (!q || userAnswer == null || userAnswer === '') return { correct: false, marks: 0 }
  const norm = s => (s || '').trim().toUpperCase().replace(/\s+/g, ' ')

  if (q.answer_type === 'single') {
    const correct = norm(userAnswer) === norm(q.correct_answer)
    return { correct, marks: correct ? 2 : 0 }
  }
  if (q.answer_type === 'multi') {
    const u = (userAnswer || '').split(',').map(s => s.trim().toUpperCase()).filter(Boolean).sort().join(',')
    const c = (q.correct_answer || '').split(',').map(s => s.trim().toUpperCase()).filter(Boolean).sort().join(',')
    const correct = u === c
    return { correct, marks: correct ? 2 : 0 }
  }
  if (q.answer_type === 'numeric') {
    const strip = s => parseFloat((s || '').replace(/[$%,\s]/g, ''))
    const u = strip(userAnswer)
    const c = strip(q.correct_answer)
    if (isNaN(u) || isNaN(c)) return { correct: false, marks: 0 }
    const correct = Math.abs(u - c) <= 1
    return { correct, marks: correct ? 2 : 0 }
  }
  // text — self-mark
  return { correct: null, marks: null }
}
