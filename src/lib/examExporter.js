import { saveAs } from 'file-saver'

// ─── Word Document Export ───────────────────────────────────────────────────

async function buildWordDoc(session, items) {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, TableRow, TableCell, Table, WidthType } = await import('docx')

  const subject = session?.subject || 'PM'
  const date = new Date(session?.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })

  function heading(text, level = HeadingLevel.HEADING_1) {
    return new Paragraph({ text, heading: level, spacing: { before: 320, after: 160 } })
  }

  function para(text, opts = {}) {
    return new Paragraph({
      children: [new TextRun({ text: text || '', size: 22, font: 'Calibri', ...opts })],
      spacing: { after: 120 },
    })
  }

  function rule() {
    return new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CCCCCC' } },
      spacing: { after: 240 },
    })
  }

  // ── Section C items ──
  const sectionC = items.filter(i => i.section === 'C')

  const children = [
    new Paragraph({
      children: [new TextRun({ text: `ACCA ${subject} — Mock Exam`, bold: true, size: 36, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 160 },
    }),
    new Paragraph({
      children: [new TextRun({ text: `Generated: ${date}`, size: 20, color: '666666', font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 480 },
    }),

    heading('SECTION C — Long-Form Questions'),
    para('Instructions: Answer BOTH questions. Each question carries 20 marks.'),
    rule(),
  ]

  sectionC.forEach((item, qIdx) => {
    const q = item.questionData
    if (!q) return
    const parts = q.parts || []

    children.push(
      new Paragraph({
        children: [new TextRun({ text: `Question C${qIdx + 1}`, bold: true, size: 28, font: 'Calibri' })],
        spacing: { before: 400, after: 80 },
      }),
      new Paragraph({
        children: [new TextRun({ text: `Topic: ${q.topic_name || ''}  |  ${q.exam_session || ''}`, size: 18, color: '888888', font: 'Calibri', italics: true })],
        spacing: { after: 200 },
      }),
    )

    if (q.scenario) {
      children.push(
        new Paragraph({ children: [new TextRun({ text: 'SCENARIO', bold: true, size: 20, font: 'Calibri' })], spacing: { after: 80 } }),
        ...q.scenario.split('\n').filter(Boolean).map(line => para(line)),
        rule(),
      )
    }

    parts.forEach(p => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `Part ${p.part}: `, bold: true, size: 22, font: 'Calibri' }),
            new TextRun({ text: p.requirement || '', size: 22, font: 'Calibri' }),
          ],
          spacing: { before: 240, after: 160 },
        }),
        // Answer lines
        ...Array.from({ length: 12 }, () => new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'DDDDDD' } },
          spacing: { after: 200 },
        })),
      )
    })
  })

  // ── Solutions appendix ──
  children.push(
    new Paragraph({ pageBreakBefore: true }),
    heading('SOLUTIONS — Section C'),
    para('Model answers for examiner reference.'),
    rule(),
  )

  sectionC.forEach((item, qIdx) => {
    const q = item.questionData
    if (!q) return
    const parts = q.parts || []

    children.push(
      new Paragraph({
        children: [new TextRun({ text: `Question C${qIdx + 1} — ${q.topic_name || ''}`, bold: true, size: 26, font: 'Calibri' })],
        spacing: { before: 320, after: 160 },
      }),
    )

    parts.forEach(p => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `Part ${p.part}: `, bold: true, size: 22, font: 'Calibri' }),
            new TextRun({ text: p.requirement || '', italics: true, size: 22, font: 'Calibri' }),
          ],
          spacing: { before: 200, after: 80 },
        }),
        ...((p.answer || 'No model answer provided.').split('\n').filter(Boolean).map(line =>
          new Paragraph({
            children: [new TextRun({ text: line, size: 20, font: 'Calibri', color: '1a4a2a' })],
            spacing: { after: 80 },
          })
        )),
        rule(),
      )
    })
  })

  const doc = new Document({ sections: [{ children }] })
  const blob = await Packer.toBlob(doc)
  saveAs(blob, `mockly-${subject}-mock-${session?.id?.slice(0, 8) || 'exam'}.docx`)
}

// ─── Excel Export ─────────────────────────────────────────────────────────────

async function buildExcel(session, items) {
  const XLSX = await import('xlsx')

  const subject = session?.subject || 'PM'
  const wb = XLSX.utils.book_new()

  const sectionA = items.filter(i => i.section === 'A')
  const sectionB = items.filter(i => i.section === 'B')
  const sectionC = items.filter(i => i.section === 'C')

  // ── Sheet 1: Answer Key (A & B) ──
  const answerRows = [
    ['ACCA PM Mock — Answer Key', '', '', ''],
    [`Generated: ${new Date(session?.created_at).toLocaleDateString('en-GB')}`, '', '', ''],
    [],
    ['Q#', 'Section', 'Topic', 'Correct Answer', 'Marks'],
    ...sectionA.map((item, i) => {
      const q = item.questionData
      return [i + 1, 'A — MCQ', q?.topic_name || '', q?.correct_answer || '', 2]
    }),
    [],
    ...sectionB.map((item, i) => {
      const q = item.questionData
      return [i + 1, 'B — MTQ', q?.topic_name || '', q?.correct_answer || '', 2]
    }),
  ]
  const ws1 = XLSX.utils.aoa_to_sheet(answerRows)
  ws1['!cols'] = [{ wch: 6 }, { wch: 14 }, { wch: 32 }, { wch: 18 }, { wch: 8 }]
  XLSX.utils.book_append_sheet(wb, ws1, 'Answer Key')

  // ── Sheet 2: Section C Solutions ──
  const solutionRows = [
    ['ACCA PM Mock — Section C Model Answers', ''],
    [],
  ]
  sectionC.forEach((item, qIdx) => {
    const q = item.questionData
    if (!q) return
    solutionRows.push([`C${qIdx + 1}: ${q.topic_name || ''}`, q.exam_session || ''])
    solutionRows.push(['Scenario (excerpt):', (q.scenario || '').substring(0, 200)])
    solutionRows.push([]);
    (q.parts || []).forEach(p => {
      solutionRows.push([`Part ${p.part}:`, p.requirement || ''])
      solutionRows.push(['Model Answer:', p.answer || ''])
      solutionRows.push([])
    })
    solutionRows.push([])
  })
  const ws2 = XLSX.utils.aoa_to_sheet(solutionRows)
  ws2['!cols'] = [{ wch: 22 }, { wch: 80 }]
  XLSX.utils.book_append_sheet(wb, ws2, 'Section C Solutions')

  // ── Sheet 3: Student Score Template ──
  const scoreRows = [
    ['ACCA PM Mock — Student Score Sheet', '', '', '', ''],
    [`Mock ID: ${session?.id || ''}`, '', '', '', ''],
    [],
    ['Section', 'Questions', 'Max Marks', 'Student Score', 'Notes'],
    ['Section A — MCQ', sectionA.length, sectionA.length * 2, '', 'Auto-marked'],
    ['Section B — MTQ', sectionB.length, sectionB.length * 2, '', 'Auto-marked'],
    ['Section C — Long Form', sectionC.length, 40, '', 'Self-marked'],
    [],
    ['TOTAL', sectionA.length + sectionB.length + sectionC.length, 100, '=D5+D6+D7', ''],
    [],
    ['Pass mark: 50% (50/100)', '', '', '', ''],
  ]
  const ws3 = XLSX.utils.aoa_to_sheet(scoreRows)
  ws3['!cols'] = [{ wch: 26 }, { wch: 12 }, { wch: 12 }, { wch: 16 }, { wch: 20 }]
  XLSX.utils.book_append_sheet(wb, ws3, 'Score Template')

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), `mockly-${subject}-mock-${session?.id?.slice(0, 8) || 'exam'}.xlsx`)
}

export async function exportWord(session, items) {
  try {
    await buildWordDoc(session, items)
  } catch (e) {
    console.error('Word export failed:', e)
    alert('Word export failed: ' + e.message)
  }
}

export async function exportExcel(session, items) {
  try {
    await buildExcel(session, items)
  } catch (e) {
    console.error('Excel export failed:', e)
    alert('Excel export failed: ' + e.message)
  }
}
