import React from 'react'

const Icon = ({ d, size = 18, fill = 'none', stroke = 'currentColor', sw = 1.75, children, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}>
    {d ? <path d={d} /> : children}
  </svg>
)

export const Icons = {
  home:     (p) => <Icon {...p}><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" /></Icon>,
  flask:    (p) => <Icon {...p}><path d="M9 3h6" /><path d="M10 3v7l-5 8a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-8V3" /><path d="M7.5 14h9" /></Icon>,
  history:  (p) => <Icon {...p}><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /><path d="M12 7v5l3 2" /></Icon>,
  target:   (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></Icon>,
  trophy:   (p) => <Icon {...p}><path d="M8 4h8v5a4 4 0 0 1-8 0V4z"/><path d="M5 5H3v2a3 3 0 0 0 3 3"/><path d="M19 5h2v2a3 3 0 0 1-3 3"/><path d="M9 14h6"/><path d="M10 14v3a2 2 0 0 0 2 2 2 2 0 0 0 2-2v-3"/><path d="M8 21h8"/></Icon>,
  search:   (p) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></Icon>,
  bell:     (p) => <Icon {...p}><path d="M6 8a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 18a2 2 0 0 0 4 0"/></Icon>,
  arrow:    (p) => <Icon {...p}><path d="M5 12h14M13 5l7 7-7 7"/></Icon>,
  check:    (p) => <Icon {...p}><path d="M5 12l5 5L20 7"/></Icon>,
  x:        (p) => <Icon {...p}><path d="M6 6l12 12M18 6L6 18"/></Icon>,
  flame:    (p) => <Icon {...p}><path d="M12 2s4 4 4 8a4 4 0 1 1-8 0c0-2 1-3 1-5"/><path d="M8 14a4 4 0 0 0 8 0c0-2-2-2-2-5"/></Icon>,
  clock:    (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Icon>,
  book:     (p) => <Icon {...p}><path d="M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3V4z"/><path d="M4 17a3 3 0 0 1 3-3h11"/></Icon>,
  brain:    (p) => <Icon {...p}><path d="M9 4a3 3 0 0 0-3 3v1a3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 3 3 3 3 0 0 0 3-3V4"/><path d="M15 4a3 3 0 0 1 3 3v1a3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-3 3 3 3 0 0 1-3-3"/></Icon>,
  bolt:     (p) => <Icon {...p}><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></Icon>,
  chart:    (p) => <Icon {...p}><path d="M3 3v18h18"/><path d="M7 14l4-4 4 3 5-7"/></Icon>,
  flag:     (p) => <Icon {...p}><path d="M5 3v18"/><path d="M5 4h13l-2 4 2 4H5"/></Icon>,
  filter:   (p) => <Icon {...p}><path d="M3 5h18l-7 9v6l-4-2v-4z"/></Icon>,
  plus:     (p) => <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>,
  download: (p) => <Icon {...p}><path d="M12 4v12"/><path d="M7 12l5 5 5-5"/><path d="M5 20h14"/></Icon>,
  settings: (p) => <Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 0 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></Icon>,
  sparkle:  (p) => <Icon {...p}><path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M5 19l3-3M16 8l3-3"/></Icon>,
  layers:   (p) => <Icon {...p}><path d="M12 2L2 7l10 5 10-5z"/><path d="M2 12l10 5 10-5"/><path d="M2 17l10 5 10-5"/></Icon>,
  fileDoc:  (p) => <Icon {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8M16 17H8M10 9H8"/></Icon>,
  fileXls:  (p) => <Icon {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13l4 4M12 13l-4 4"/></Icon>,
}

export default Icons
