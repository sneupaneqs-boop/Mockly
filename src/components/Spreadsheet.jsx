import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import HyperFormula from 'hyperformula'

const COLS = 26
const ROWS = 60
const COL_WIDTH = 100
const ROW_HEIGHT = 24
const ROW_HEADER_WIDTH = 40

const colLabel = (i) => {
  let s = ''
  let n = i + 1
  while (n > 0) {
    s = String.fromCharCode(64 + (n % 26 || 26)) + s
    n = Math.floor((n - 1) / 26)
  }
  return s
}

const cellId = (r, c) => `${colLabel(c)}${r + 1}`

const defaultCells = () => {
  const cells = {}
  return cells
}

export default function Spreadsheet({ value, onChange }) {
  const [cells, setCells] = useState(() => {
    try { return value ? JSON.parse(value) : defaultCells() } catch { return defaultCells() }
  })
  const [selected, setSelected] = useState({ r: 0, c: 0 })
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const [selRange, setSelRange] = useState(null) // {r1,c1,r2,c2}
  const [colWidths, setColWidths] = useState(() => Array(COLS).fill(COL_WIDTH))
  const [formats, setFormats] = useState({}) // cellId -> {bold, italic, underline, align, color, bg, fontSize}
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(null)
  const editRef = useRef(null)
  const containerRef = useRef(null)
  const hfRef = useRef(null)

  // Init HyperFormula
  useEffect(() => {
    hfRef.current = HyperFormula.buildEmpty({ licenseKey: 'gpl-v3' })
    hfRef.current.addSheet('Sheet1')
    return () => hfRef.current?.destroy()
  }, [])

  // Sync cells → HyperFormula
  useEffect(() => {
    if (!hfRef.current) return
    const sheetId = hfRef.current.getSheetId('Sheet1')
    if (sheetId === undefined) return
    // Build 2D array
    const grid = Array.from({ length: ROWS }, (_, r) =>
      Array.from({ length: COLS }, (_, c) => {
        const id = cellId(r, c)
        return cells[id]?.formula || cells[id]?.value || ''
      })
    )
    try {
      hfRef.current.setSheetContent(sheetId, grid)
    } catch (e) {}
  }, [cells])

  const getCellDisplay = useCallback((r, c) => {
    const id = cellId(r, c)
    const cell = cells[id]
    if (!cell) return ''
    if (cell.formula && hfRef.current) {
      const sheetId = hfRef.current.getSheetId('Sheet1')
      try {
        const val = hfRef.current.getCellValue({ sheet: sheetId, row: r, col: c })
        if (val instanceof Error) return '#ERR'
        if (val === null || val === undefined) return ''
        return String(val)
      } catch { return cell.formula }
    }
    return cell.value || ''
  }, [cells])

  // Notify parent
  useEffect(() => {
    onChange?.(JSON.stringify(cells))
  }, [cells])

  const setCell = useCallback((r, c, raw) => {
    const id = cellId(r, c)
    setCells(prev => {
      const next = { ...prev }
      if (raw === '' || raw === null || raw === undefined) {
        delete next[id]
        return next
      }
      const isFormula = String(raw).startsWith('=')
      next[id] = isFormula ? { formula: raw } : { value: raw }
      return next
    })
  }, [])

  const startEdit = useCallback((r, c, initial = null) => {
    const id = cellId(r, c)
    const cell = cells[id]
    const val = initial !== null ? initial : (cell?.formula || cell?.value || '')
    setEditing(true)
    setEditValue(val)
    setTimeout(() => editRef.current?.focus(), 0)
  }, [cells])

  const commitEdit = useCallback(() => {
    if (!editing) return
    setCell(selected.r, selected.c, editValue)
    setEditing(false)
  }, [editing, editValue, selected, setCell])

  const moveSelection = useCallback((dr, dc) => {
    if (editing) { commitEdit() }
    setSelected(prev => ({
      r: Math.max(0, Math.min(ROWS - 1, prev.r + dr)),
      c: Math.max(0, Math.min(COLS - 1, prev.c + dc)),
    }))
    setSelRange(null)
  }, [editing, commitEdit])

  const handleKeyDown = useCallback((e) => {
    if (editing) {
      if (e.key === 'Enter') { e.preventDefault(); commitEdit(); moveSelection(1, 0) }
      else if (e.key === 'Tab') { e.preventDefault(); commitEdit(); moveSelection(0, e.shiftKey ? -1 : 1) }
      else if (e.key === 'Escape') { setEditing(false); setEditValue('') }
      return
    }
    if (e.key === 'Enter' || e.key === 'F2') { e.preventDefault(); startEdit(selected.r, selected.c) }
    else if (e.key === 'Tab') { e.preventDefault(); moveSelection(0, e.shiftKey ? -1 : 1) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); moveSelection(-1, 0) }
    else if (e.key === 'ArrowDown') { e.preventDefault(); moveSelection(1, 0) }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); moveSelection(0, -1) }
    else if (e.key === 'ArrowRight') { e.preventDefault(); moveSelection(0, 1) }
    else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault()
      if (selRange) {
        const { r1, c1, r2, c2 } = selRange
        for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) setCell(r, c, '')
      } else setCell(selected.r, selected.c, '')
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      startEdit(selected.r, selected.c, e.key)
    }
  }, [editing, selected, selRange, moveSelection, commitEdit, startEdit, setCell])

  const toggleFormat = useCallback((fmt) => {
    const id = cellId(selected.r, selected.c)
    setFormats(prev => {
      const cur = prev[id] || {}
      return { ...prev, [id]: { ...cur, [fmt]: !cur[fmt] } }
    })
  }, [selected])

  const setFormatValue = useCallback((fmt, val) => {
    const id = cellId(selected.r, selected.c)
    setFormats(prev => {
      const cur = prev[id] || {}
      return { ...prev, [id]: { ...cur, [fmt]: val } }
    })
  }, [selected])

  const getFmt = useCallback((r, c) => formats[cellId(r, c)] || {}, [formats])

  const inRange = useCallback((r, c) => {
    if (!selRange) return false
    const { r1, c1, r2, c2 } = selRange
    return r >= r1 && r <= r2 && c >= c1 && c <= c2
  }, [selRange])

  const formulaBarValue = useMemo(() => {
    const id = cellId(selected.r, selected.c)
    const cell = cells[id]
    if (!cell) return ''
    return cell.formula || cell.value || ''
  }, [selected, cells])

  const handleCellMouseDown = (r, c, e) => {
    e.preventDefault()
    if (editing) commitEdit()
    setSelected({ r, c })
    setSelRange(null)
    setIsDragging(true)
    setDragStart({ r, c })
    containerRef.current?.focus()
  }

  const handleCellMouseEnter = (r, c) => {
    if (!isDragging || !dragStart) return
    setSelRange({
      r1: Math.min(dragStart.r, r),
      c1: Math.min(dragStart.c, c),
      r2: Math.max(dragStart.r, r),
      c2: Math.max(dragStart.c, c),
    })
  }

  const handleMouseUp = () => setIsDragging(false)

  const handleColHeaderClick = (c) => {
    setSelected({ r: 0, c })
    setSelRange({ r1: 0, c1: c, r2: ROWS - 1, c2: c })
  }

  const handleRowHeaderClick = (r) => {
    setSelected({ r, c: 0 })
    setSelRange({ r1: r, c1: 0, r2: r, c2: COLS - 1 })
  }

  // Ctrl+B, Ctrl+I, Ctrl+U
  const handleContainerKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && !editing) {
      if (e.key === 'b') { e.preventDefault(); toggleFormat('bold') }
      if (e.key === 'i') { e.preventDefault(); toggleFormat('italic') }
      if (e.key === 'u') { e.preventDefault(); toggleFormat('underline') }
    }
    handleKeyDown(e)
  }

  const curFmt = getFmt(selected.r, selected.c)

  return (
    <div className="flex flex-col h-full w-full select-none" style={{ fontFamily: 'Calibri, Arial, sans-serif', fontSize: 13 }}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1 border-b border-gray-300 bg-gray-50 flex-shrink-0 flex-wrap">
        <select
          className="border border-gray-300 text-xs px-1 py-0.5 h-6"
          value={curFmt.fontSize || 11}
          onChange={e => setFormatValue('fontSize', parseInt(e.target.value))}
        >
          {[8,9,10,11,12,14,16,18,20,22,24,28,36,48,72].map(s => <option key={s}>{s}</option>)}
        </select>
        <div className="w-px h-5 bg-gray-300 mx-0.5" />
        <ToolBtn active={curFmt.bold} onClick={() => toggleFormat('bold')} title="Bold (Ctrl+B)"><b>B</b></ToolBtn>
        <ToolBtn active={curFmt.italic} onClick={() => toggleFormat('italic')} title="Italic (Ctrl+I)"><i>I</i></ToolBtn>
        <ToolBtn active={curFmt.underline} onClick={() => toggleFormat('underline')} title="Underline (Ctrl+U)"><u>U</u></ToolBtn>
        <div className="w-px h-5 bg-gray-300 mx-0.5" />
        <ToolBtn active={curFmt.align === 'left'} onClick={() => setFormatValue('align', 'left')} title="Align Left">⬛</ToolBtn>
        <ToolBtn active={curFmt.align === 'center'} onClick={() => setFormatValue('align', 'center')} title="Center">≡</ToolBtn>
        <ToolBtn active={curFmt.align === 'right'} onClick={() => setFormatValue('align', 'right')} title="Align Right">▤</ToolBtn>
        <div className="w-px h-5 bg-gray-300 mx-0.5" />
        <label className="text-xs flex items-center gap-1 cursor-pointer" title="Text color">
          <span style={{ fontWeight: 'bold', fontSize: 12 }}>A</span>
          <input type="color" className="w-4 h-4 border-0 p-0 cursor-pointer" value={curFmt.color || '#000000'} onChange={e => setFormatValue('color', e.target.value)} />
        </label>
        <label className="text-xs flex items-center gap-1 cursor-pointer" title="Fill color">
          <span style={{ fontSize: 12 }}>🎨</span>
          <input type="color" className="w-4 h-4 border-0 p-0 cursor-pointer" value={curFmt.bg || '#ffffff'} onChange={e => setFormatValue('bg', e.target.value)} />
        </label>
        <div className="w-px h-5 bg-gray-300 mx-0.5" />
        <select
          className="border border-gray-300 text-xs px-1 py-0.5 h-6"
          value={curFmt.format || 'general'}
          onChange={e => setFormatValue('format', e.target.value)}
          title="Number format"
        >
          <option value="general">General</option>
          <option value="number">Number</option>
          <option value="currency">Currency ($)</option>
          <option value="percent">Percent (%)</option>
          <option value="accounting">Accounting</option>
        </select>
      </div>

      {/* Formula bar */}
      <div className="flex items-center border-b border-gray-300 bg-white flex-shrink-0" style={{ height: 26 }}>
        <div className="flex items-center justify-center border-r border-gray-300 text-xs font-bold text-gray-600 px-2" style={{ minWidth: 56, height: '100%' }}>
          {cellId(selected.r, selected.c)}
        </div>
        <span className="text-gray-400 px-1 text-sm">fx</span>
        <input
          className="flex-1 text-sm px-2 outline-none bg-white"
          style={{ height: '100%' }}
          value={editing ? editValue : formulaBarValue}
          onChange={e => {
            if (editing) setEditValue(e.target.value)
            else { startEdit(selected.r, selected.c, e.target.value) }
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') { e.preventDefault(); commitEdit(); moveSelection(1, 0) }
            if (e.key === 'Escape') { setEditing(false); setEditValue('') }
          }}
        />
      </div>

      {/* Grid */}
      <div
        className="flex-1 overflow-auto outline-none"
        ref={containerRef}
        tabIndex={0}
        onKeyDown={handleContainerKeyDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <table style={{ borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: ROW_HEADER_WIDTH + COLS * COL_WIDTH }}>
          <colgroup>
            <col style={{ width: ROW_HEADER_WIDTH }} />
            {Array.from({ length: COLS }, (_, c) => (
              <col key={c} style={{ width: colWidths[c] }} />
            ))}
          </colgroup>
          <thead>
            <tr style={{ height: ROW_HEIGHT }}>
              <th style={{ background: '#f2f2f2', border: '1px solid #d0d0d0', position: 'sticky', top: 0, left: 0, zIndex: 3 }} />
              {Array.from({ length: COLS }, (_, c) => (
                <th
                  key={c}
                  onClick={() => handleColHeaderClick(c)}
                  style={{
                    background: selRange && c >= selRange.c1 && c <= selRange.c2 ? '#b3d4f5' : selected.c === c ? '#e8f0fa' : '#f2f2f2',
                    border: '1px solid #d0d0d0',
                    fontSize: 12,
                    fontWeight: 600,
                    textAlign: 'center',
                    cursor: 'pointer',
                    position: 'sticky',
                    top: 0,
                    zIndex: 2,
                    userSelect: 'none',
                  }}
                >
                  {colLabel(c)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: ROWS }, (_, r) => (
              <tr key={r} style={{ height: ROW_HEIGHT }}>
                <td
                  onClick={() => handleRowHeaderClick(r)}
                  style={{
                    background: selRange && r >= selRange.r1 && r <= selRange.r2 ? '#b3d4f5' : selected.r === r ? '#e8f0fa' : '#f2f2f2',
                    border: '1px solid #d0d0d0',
                    fontSize: 12,
                    textAlign: 'center',
                    cursor: 'pointer',
                    fontWeight: 500,
                    position: 'sticky',
                    left: 0,
                    zIndex: 1,
                    userSelect: 'none',
                  }}
                >
                  {r + 1}
                </td>
                {Array.from({ length: COLS }, (_, c) => {
                  const isSelected = selected.r === r && selected.c === c
                  const isInRange = inRange(r, c)
                  const fmt = getFmt(r, c)
                  const display = getCellDisplay(r, c)
                  return (
                    <CellTd
                      key={c}
                      r={r} c={c}
                      isSelected={isSelected}
                      isInRange={isInRange}
                      isEditing={isSelected && editing}
                      editValue={editValue}
                      display={display}
                      fmt={fmt}
                      onMouseDown={handleCellMouseDown}
                      onMouseEnter={handleCellMouseEnter}
                      onDoubleClick={() => startEdit(r, c)}
                      onEditChange={setEditValue}
                      onEditKeyDown={handleKeyDown}
                      editRef={isSelected ? editRef : null}
                    />
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ToolBtn({ active, onClick, title, children }) {
  return (
    <button
      onMouseDown={e => { e.preventDefault(); onClick() }}
      title={title}
      style={{
        padding: '0 5px',
        height: 22,
        minWidth: 22,
        border: '1px solid',
        borderColor: active ? '#0f4c81' : '#ccc',
        background: active ? '#e8f0fa' : '#fff',
        cursor: 'pointer',
        fontSize: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 2,
      }}
    >
      {children}
    </button>
  )
}

function CellTd({ r, c, isSelected, isInRange, isEditing, editValue, display, fmt, onMouseDown, onMouseEnter, onDoubleClick, onEditChange, onEditKeyDown, editRef }) {
  const formatted = useMemo(() => {
    if (!display && display !== 0) return ''
    const val = parseFloat(display)
    if (isNaN(val)) return display
    switch (fmt.format) {
      case 'currency': return '$' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      case 'percent': return (val * 100).toFixed(2) + '%'
      case 'accounting': return val < 0 ? `(${Math.abs(val).toLocaleString()})` : val.toLocaleString()
      case 'number': return val.toLocaleString()
      default: return display
    }
  }, [display, fmt.format])

  return (
    <td
      onMouseDown={e => onMouseDown(r, c, e)}
      onMouseEnter={() => onMouseEnter(r, c)}
      onDoubleClick={onDoubleClick}
      style={{
        border: isSelected ? '2px solid #0f4c81' : '1px solid #d0d0d0',
        background: fmt.bg && fmt.bg !== '#ffffff' ? fmt.bg : isInRange && !isSelected ? '#c7dcf8' : '#fff',
        padding: 0,
        position: 'relative',
        boxSizing: 'border-box',
        overflow: isEditing ? 'visible' : 'hidden',
        zIndex: isEditing ? 10 : isSelected ? 5 : 'auto',
      }}
    >
      {isEditing ? (
        <input
          ref={editRef}
          value={editValue}
          onChange={e => onEditChange(e.target.value)}
          onKeyDown={onEditKeyDown}
          style={{
            position: 'absolute',
            top: 0, left: 0,
            minWidth: '100%',
            height: '100%',
            border: 'none',
            outline: '2px solid #0f4c81',
            padding: '0 3px',
            fontSize: fmt.fontSize || 11,
            fontWeight: fmt.bold ? 'bold' : 'normal',
            fontStyle: fmt.italic ? 'italic' : 'normal',
            textDecoration: fmt.underline ? 'underline' : 'none',
            textAlign: fmt.align || 'left',
            color: fmt.color || '#000',
            background: fmt.bg || '#fff',
            zIndex: 20,
            boxSizing: 'border-box',
          }}
        />
      ) : (
        <div
          style={{
            padding: '0 3px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: fmt.align === 'right' ? 'flex-end' : fmt.align === 'center' ? 'center' : 'flex-start',
            fontSize: fmt.fontSize || 11,
            fontWeight: fmt.bold ? 'bold' : 'normal',
            fontStyle: fmt.italic ? 'italic' : 'normal',
            textDecoration: fmt.underline ? 'underline' : 'none',
            color: fmt.color || '#000',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
        >
          {formatted}
        </div>
      )}
    </td>
  )
}
