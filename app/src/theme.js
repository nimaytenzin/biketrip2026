// Palette validated with the dataviz six-checks validator (light surface #fcfcfb):
// lightness band, chroma floor, CVD separation all PASS; aqua/yellow are sub-3:1
// on the light surface, so day identity is never color-alone (legend chips,
// direct labels and the itinerary table carry it too).
export const DAY_COLORS = ['#2a78d6', '#1baf7a', '#eda100', '#008300', '#4a3aa7', '#e34948']

// internal bookkeeping keys, not rider-facing — hidden everywhere in the UI
export const HIDDEN_CLASSES = new Set(['Unknown', '(gap in data)'])

export function visibleClassKm(classKm) {
  return Object.fromEntries(
    Object.entries(classKm).filter(([k]) => !HIDDEN_CLASSES.has(k)),
  )
}

// Road classes as an ordinal single-hue ramp (blue, darkest = highest class).
export const CLASS_RAMP = {
  'Asian Highway': '#0d366b',
  'Primary Highway': '#104281',
  'Secondary National H': '#1c5cab',
  'Dzongkhag Road': '#2a78d6',
  'Thromdee Roads': '#5598e7',
  'Access Road': '#6da7ec',
  'Farm Road': '#86b6ef',
  Unknown: '#c3c2b7',
  '(gap in data)': '#e1e0d9',
}

export const CLASS_LABELS = {
  'Asian Highway': 'Asian Highway',
  'Primary Highway': 'Highway',
  'Secondary National H': 'Secondary highway',
  'Dzongkhag Road': 'District road',
  'Thromdee Roads': 'Town streets',
  'Access Road': 'Access track',
  'Farm Road': 'Farm track · off-road',
  '(gap in data)': 'Gap in road data',
}

export function classLabel(k) {
  return CLASS_LABELS[k] || k
}

export function fmtHours(h) {
  const hh = Math.floor(h)
  const mm = Math.round((h - hh) * 60)
  return mm ? `${hh} h ${String(mm).padStart(2, '0')} m` : `${hh} h`
}
