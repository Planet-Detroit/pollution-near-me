// Map center coordinates
export const METRO_DETROIT_CENTER = [42.35, -83.1]
export const MICHIGAN_CENTER = [44.5, -84.7]
export const METRO_DETROIT_ZOOM = 10
export const MICHIGAN_ZOOM = 6

// Search radius presets (in miles)
export const RADIUS_PRESETS = [
  { label: 'My block', miles: 0.5, meters: 804.67 },
  { label: 'My neighborhood', miles: 1, meters: 1609.34 },
  { label: 'My area', miles: 3, meters: 4828.03 },
]
export const DEFAULT_RADIUS_INDEX = 2 // "My area" (3 miles)

// Compliance status colors and labels
export const COMPLIANCE_COLORS = {
  'High Priority Violation': { color: '#dc2626', label: 'High Priority Violation', shortLabel: 'High Priority Violation' },
  'Violation w/in 1 Year': { color: '#f97316', label: 'Violation Within Past Year', shortLabel: 'Recent Violation' },
  'No Violation Identified': { color: '#333333', label: 'No Violations Identified', shortLabel: 'No Violations' },
  unknown: { color: '#9ca3af', label: 'Status Unknown', shortLabel: 'Unknown' },
}

// Facility classification sizes (marker radius in pixels)
export const CLASSIFICATION_SIZES = {
  'Major Emissions': 14,
  'Synthetic Minor Emissions': 10,
  '80% Synthetic Minor Emissions': 10,
  'Minor Emissions': 8,
}
export const DEFAULT_MARKER_SIZE = 8

// Translate ECHO program codes to plain English
// url is optional — links to the authoritative program page when available
export const PROGRAM_LABELS = {
  SIP: { label: 'State Implementation Plan', url: 'https://www.michigan.gov/egle/about/organization/air-quality/state-implementation-plan' },
  TVP: { label: 'Title V (Major Source) Permit' },
  FESOP: { label: 'Federally Enforceable State Operating Permit' },
  NSR: { label: 'New Source Review Permit' },
  MACT: { label: 'Maximum Achievable Control Technology' },
  NSPS: { label: 'New Source Performance Standards' },
  GACTM: { label: 'Generally Available Control Technology' },
  PSD: { label: 'Prevention of Significant Deterioration' },
  NESH: { label: 'National Emission Standards for Hazardous Air Pollutants' },
  GHG: { label: 'Greenhouse Gas Reporting' },
  CFC: { label: 'Chlorofluorocarbon Regulations' },
  AR: { label: 'Acid Rain Program' },
}

/** Helper to get the label string for a program code */
export function getProgramLabel(code) {
  const entry = PROGRAM_LABELS[code]
  if (!entry) return code
  return typeof entry === 'string' ? entry : entry.label
}

/** Helper to get the URL for a program code (or null) */
export function getProgramUrl(code) {
  const entry = PROGRAM_LABELS[code]
  if (!entry || typeof entry === 'string') return null
  return entry.url || null
}

// NAICS code to plain-English industry (common Michigan industries)
export const NAICS_LABELS = {
  '324110': 'Petroleum Refinery',
  '331110': 'Iron & Steel Mill',
  '327310': 'Cement Manufacturing',
  '562211': 'Hazardous Waste Treatment',
  '562212': 'Solid Waste Landfill',
  '221112': 'Fossil Fuel Power Plant',
  '221117': 'Biomass Power Plant',
  '336111': 'Automobile Manufacturing',
  '336112': 'Light Truck Manufacturing',
  '336390': 'Auto Parts Manufacturing',
  '325110': 'Petrochemical Manufacturing',
  '325199': 'Chemical Manufacturing',
  '322121': 'Paper Mill',
  '327420': 'Gypsum Product Manufacturing',
  '311221': 'Wet Corn Milling',
  '332811': 'Metal Heat Treating',
  '332813': 'Electroplating & Metal Finishing',
}
