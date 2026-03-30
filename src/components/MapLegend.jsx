import { COMPLIANCE_COLORS, CLASSIFICATION_SIZES } from '../lib/constants'

const STATUS_ITEMS = [
  { key: 'High Priority Violation', size: 14 },
  { key: 'Violation w/in 1 Year', size: 14 },
  { key: 'No Violation Identified', size: 14 },
  { key: 'unknown', size: 14 },
]

const SIZE_ITEMS = [
  {
    label: 'Major source',
    size: CLASSIFICATION_SIZES['Major Emissions'],
    tooltip: 'Emits or could emit 100+ tons/year of a regulated pollutant, or 10+ tons/year of a single hazardous air pollutant. Subject to the strictest regulations including Title V permits.',
  },
  {
    label: 'Synthetic minor',
    size: CLASSIFICATION_SIZES['Synthetic Minor Emissions'],
    tooltip: 'Could qualify as Major based on equipment capacity, but has accepted enforceable permit limits to keep emissions below Major thresholds.',
  },
  {
    label: 'Minor source',
    size: CLASSIFICATION_SIZES['Minor Emissions'],
    tooltip: 'Actual and potential emissions are below Major source thresholds. Still regulated but with less stringent permitting requirements.',
  },
]

export default function MapLegend() {
  return (
    <div className="map-legend">
      <div className="legend-section">
        <h4 className="legend-heading">Compliance Status</h4>
        <div className="legend-items">
          {STATUS_ITEMS.map(({ key, size }) => {
            const info = COMPLIANCE_COLORS[key]
            return (
              <div key={key} className="legend-item">
                <svg width={size * 2} height={size * 2} className="legend-dot">
                  <circle
                    cx={size}
                    cy={size}
                    r={size * 0.7}
                    fill={info.color}
                    stroke="#fff"
                    strokeWidth="1"
                    opacity="0.85"
                  />
                </svg>
                <span className="legend-label">{info.label}</span>
              </div>
            )
          })}
        </div>
      </div>
      <div className="legend-section">
        <h4 className="legend-heading">Facility Size (emissions potential)</h4>
        <div className="legend-items">
          {SIZE_ITEMS.map(({ label, size, tooltip }) => (
            <div key={label} className="legend-item legend-item-with-tooltip">
              <svg width={28} height={28} className="legend-dot">
                <circle
                  cx={14}
                  cy={14}
                  r={size}
                  fill="#999"
                  stroke="#fff"
                  strokeWidth="1"
                  opacity="0.85"
                />
              </svg>
              <span className="legend-label">{label}</span>
              <span className="legend-tooltip-trigger" aria-label={tooltip}>
                ?
                <span className="legend-tooltip">{tooltip}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
