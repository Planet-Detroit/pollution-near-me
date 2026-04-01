import { COMPLIANCE_COLORS, RADIUS_PRESETS } from '../lib/constants'

function formatCurrency(amount) {
  if (!amount || amount === 0) return '$0'
  return '$' + amount.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

export default function SummaryPanel({ stats, radiusIndex, lastSyncDate }) {
  if (!stats) return null

  const radius = RADIUS_PRESETS[radiusIndex]

  return (
    <div className="summary-panel">
      <h2 className="summary-title">
        {stats.total === 0
          ? `No regulated air pollution sources found within ${radius.miles} mile${radius.miles !== 1 ? 's' : ''}`
          : `${stats.total} air pollution source${stats.total !== 1 ? 's' : ''} within ${radius.miles} mile${radius.miles !== 1 ? 's' : ''}`
        }
      </h2>

      {stats.total > 0 && (
        <>
          <div className="summary-grid">
            {stats.hpvActive > 0 && (
              <div className="summary-stat">
                <span
                  className="stat-dot"
                  style={{ backgroundColor: COMPLIANCE_COLORS['High Priority Violation'].color }}
                />
                <span className="stat-count">{stats.hpvActive}</span>
                <span className="stat-label">Active High Priority Violations (unaddressed)</span>
              </div>
            )}
            {stats.hpvAddressed > 0 && (
              <div className="summary-stat">
                <span
                  className="stat-dot"
                  style={{ backgroundColor: COMPLIANCE_COLORS['HPV Addressed'].color }}
                />
                <span className="stat-count">{stats.hpvAddressed}</span>
                <span className="stat-label">HPVs addressed by state (still on EPA record)</span>
              </div>
            )}
            <div className="summary-stat">
              <span
                className="stat-dot"
                style={{ backgroundColor: COMPLIANCE_COLORS['Violation w/in 1 Year'].color }}
              />
              <span className="stat-count">{stats.recentViolation}</span>
              <span className="stat-label">Violations</span>
            </div>
            <div className="summary-stat">
              <span
                className="stat-dot"
                style={{ backgroundColor: COMPLIANCE_COLORS['No Violation Identified'].color }}
              />
              <span className="stat-count">{stats.compliant}</span>
              <span className="stat-label">Compliant</span>
            </div>
          </div>

          <div className="summary-details">
            <p><strong>{stats.majorSources}</strong> major emission source{stats.majorSources !== 1 ? 's' : ''}</p>
            {stats.totalPenalties > 0 && (
              <p><strong>{formatCurrency(stats.totalPenalties)}</strong> in penalties assessed</p>
            )}
          </div>
        </>
      )}

      {lastSyncDate && (
        <p className="data-freshness">
          Data last updated: {lastSyncDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          {' '}&middot;{' '}
          <a href="https://echo.epa.gov/" target="_blank" rel="noopener noreferrer">Source: EPA ECHO</a>
        </p>
      )}
    </div>
  )
}
