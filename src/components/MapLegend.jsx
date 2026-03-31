import { COMPLIANCE_COLORS, CLASSIFICATION_SIZES } from '../lib/constants'

const STATUS_ITEMS = [
  {
    key: 'High Priority Violation',
    tooltip: 'Active, unresolved High Priority Violations — the most serious category. The facility has been cited for exceeding emission limits, operating without a required permit, or failing to meet compliance deadlines, and the issue has NOT yet been resolved.',
  },
  {
    key: 'HPV Addressed',
    tooltip: 'This facility was flagged for a High Priority Violation, but the issue has been resolved by the state (EGLE) or EPA. The HPV designation remains on EPA\'s federal record. Most HPV facilities in Michigan fall into this category.',
  },
  {
    key: 'Violation w/in 1 Year',
    tooltip: 'This facility has been cited for a violation in the past year, but it does not rise to "High Priority" level. May include reporting failures, minor permit deviations, or issues being actively resolved.',
  },
  {
    key: 'No Violation Identified',
    tooltip: 'No violations have been identified in EPA records. This does not mean the facility is pollution-free — it still has permits to emit pollutants. It means regulators have not cited it for violations.',
  },
  {
    key: 'unknown',
    tooltip: 'Compliance status is not available in EPA records. The facility may be closed, inactive, or not yet evaluated.',
  },
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

function LegendItemWithTooltip({ children, tooltip }) {
  return (
    <div className="legend-item legend-item-with-tooltip">
      {children}
      <span className="legend-tooltip-trigger" aria-label={tooltip}>
        ?
        <span className="legend-tooltip">{tooltip}</span>
      </span>
    </div>
  )
}

export default function MapLegend() {
  return (
    <div className="map-legend">
      <div className="legend-section">
        <h4 className="legend-heading">Compliance Status</h4>
        <div className="legend-items">
          {STATUS_ITEMS.map(({ key, tooltip }) => {
            const info = COMPLIANCE_COLORS[key]
            return (
              <LegendItemWithTooltip key={key} tooltip={tooltip}>
                <svg width={28} height={28} className="legend-dot">
                  <circle
                    cx={14}
                    cy={14}
                    r={10}
                    fill={info.color}
                    stroke="#fff"
                    strokeWidth="1"
                    opacity="0.85"
                  />
                </svg>
                <span className="legend-label">{info.label}</span>
              </LegendItemWithTooltip>
            )
          })}
        </div>
      </div>
      <div className="legend-section">
        <h4 className="legend-heading">Facility Size (emissions potential)</h4>
        <div className="legend-items">
          {SIZE_ITEMS.map(({ label, size, tooltip }) => (
            <LegendItemWithTooltip key={label} tooltip={tooltip}>
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
            </LegendItemWithTooltip>
          ))}
        </div>
      </div>
    </div>
  )
}
