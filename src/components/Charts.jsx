import React, { useState } from 'react'

export function ScoreTrendChart({ mocks }) {
  const W = 640, H = 220, P = 28
  const sorted = [...mocks].sort((a, b) => (a.date || '').localeCompare(b.date || ''))
  const scores = sorted.map(m => m.score || 0)
  const xs = sorted.map((_, i) => P + (i * (W - P * 2) / Math.max(1, sorted.length - 1)))
  const ys = scores.map(v => H - P - (v / 100) * (H - P * 2))
  const linePath = xs.map((x, i) => (i ? 'L' : 'M') + x.toFixed(1) + ',' + ys[i].toFixed(1)).join(' ')
  const areaPath = `M${xs[0]},${H - P} L` + xs.map((x, i) => x.toFixed(1) + ',' + ys[i].toFixed(1)).join(' L') + ` L${xs[xs.length - 1]},${H - P} Z`

  const [hover, setHover] = useState(null)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H }}>
      <defs>
        <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity=".3"/>
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="trendStroke" x1="0" x2="1">
          <stop offset="0%" stopColor="var(--accent)"/>
          <stop offset="100%" stopColor="var(--accent-2)"/>
        </linearGradient>
      </defs>
      {[0, 25, 50, 75, 100].map(v => {
        const y = H - P - (v / 100) * (H - P * 2)
        return (
          <g key={v}>
            <line x1={P} x2={W - P} y1={y} y2={y} stroke="var(--line)" strokeDasharray="2 4"/>
            <text x={6} y={y + 3} fontSize="9" fill="var(--ink-3)">{v}</text>
          </g>
        )
      })}
      <line x1={P} x2={W - P} y1={H - P - (50 / 100) * (H - P * 2)} y2={H - P - (50 / 100) * (H - P * 2)}
        stroke="var(--rose)" strokeDasharray="3 3" strokeOpacity=".4"/>
      <text x={W - P} y={H - P - (50 / 100) * (H - P * 2) - 4} textAnchor="end" fontSize="9" fill="var(--rose)" fontWeight="700">PASS · 50</text>
      <path d={areaPath} fill="url(#trendFill)"/>
      <path d={linePath} fill="none" stroke="url(#trendStroke)" strokeWidth="2.5" strokeLinejoin="round"/>
      {sorted.map((m, i) => (
        <g key={m.id || i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
          <circle cx={xs[i]} cy={ys[i]} r="10" fill="transparent"/>
          <circle cx={xs[i]} cy={ys[i]} r={hover === i ? 6 : 4} fill="white" stroke="var(--accent)" strokeWidth="2.5"/>
          {hover === i && (
            <g>
              <rect x={xs[i] - 46} y={ys[i] - 44} width="92" height="32" rx="6" fill="var(--ink)"/>
              <text x={xs[i]} y={ys[i] - 28} textAnchor="middle" fontSize="11" fontWeight="700" fill="white">{m.score}%</text>
              <text x={xs[i]} y={ys[i] - 16} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,.6)">{m.name || m.subject}</text>
            </g>
          )}
        </g>
      ))}
    </svg>
  )
}

export function RadarChart({ topics }) {
  const W = 280, H = 280, cx = W / 2, cy = H / 2, R = 105
  const N = Math.min(8, topics.length)
  const sel = topics.slice(0, N)
  const angle = i => (Math.PI * 2 * i / N) - Math.PI / 2
  const point = (i, r) => [cx + Math.cos(angle(i)) * r, cy + Math.sin(angle(i)) * r]
  const valuePath = sel.map((t, i) => {
    const [x, y] = point(i, (t.strength / 100) * R)
    return (i ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1)
  }).join(' ') + ' Z'

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 320 }}>
      {[0.25, 0.5, 0.75, 1].map(s => (
        <polygon key={s}
          points={Array.from({ length: N }, (_, i) => point(i, R * s).map(v => v.toFixed(1)).join(',')).join(' ')}
          fill="none" stroke="var(--line)" strokeWidth="1"/>
      ))}
      {Array.from({ length: N }, (_, i) => {
        const [x, y] = point(i, R)
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--line)" strokeWidth="1"/>
      })}
      <path d={valuePath} fill="var(--accent)" fillOpacity=".18" stroke="var(--accent)" strokeWidth="2"/>
      {sel.map((t, i) => {
        const [x, y] = point(i, (t.strength / 100) * R)
        return <circle key={t.num} cx={x} cy={y} r="3.5" fill="white" stroke="var(--accent)" strokeWidth="2"/>
      })}
      {sel.map((t, i) => {
        const [x, y] = point(i, R + 16)
        const short = t.name.length > 14 ? t.name.split(' ').slice(0, 2).join(' ') : t.name
        return (
          <text key={t.num} x={x} y={y} textAnchor="middle" fontSize="9.5" fill="var(--ink-2)" fontWeight="600">
            {short}
          </text>
        )
      })}
    </svg>
  )
}

export function Sparkline({ values, color = 'var(--accent)' }) {
  const W = 120, H = 40, P = 4
  const min = Math.min(...values), max = Math.max(...values)
  const xs = values.map((_, i) => P + (i * (W - P * 2) / Math.max(1, values.length - 1)))
  const ys = values.map(v => H - P - ((v - min) / Math.max(1, max - min)) * (H - P * 2))
  const linePath = xs.map((x, i) => (i ? 'L' : 'M') + x.toFixed(1) + ',' + ys[i].toFixed(1)).join(' ')
  const areaPath = `M${xs[0]},${H - P} L` + xs.map((x, i) => x.toFixed(1) + ',' + ys[i].toFixed(1)).join(' L') + ` L${xs[xs.length - 1]},${H - P} Z`
  const gradId = `spark-${color.replace(/[^a-z0-9]/gi, '')}`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="k-spark" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".25"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`}/>
      <path d={linePath} stroke={color} strokeWidth="1.5" fill="none"/>
    </svg>
  )
}
