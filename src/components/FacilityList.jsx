import {
  COMPLIANCE_COLORS,
  PROGRAM_LABELS,
  NAICS_LABELS,
  RADIUS_PRESETS,
} from '../lib/constants'

function getComplianceInfo(status) {
  return COMPLIANCE_COLORS[status] || COMPLIANCE_COLORS.unknown
}

function getIndustryLabel(naics) {
  if (!naics) return null
  const codes = naics.split(/[,\s]+/)
  for (const code of codes) {
    if (NAICS_LABELS[code.trim()]) return NAICS_LABELS[code.trim()]
  }
  return null
}

function extractSRN(sourceId) {
  if (!sourceId || !sourceId.startsWith('MI')) return null
  return sourceId.replace(/^MI0+/, '')
}

function formatDate(dateStr) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function formatNumber(val) {
  if (!val || val === '0' || val === 0) return null
  const num = typeof val === 'string' ? parseFloat(val) : val
  if (isNaN(num) || num === 0) return null
  return num.toLocaleString('en-US')
}

function FacilityCard({ facility }) {
  const f = facility
  const compliance = getComplianceInfo(f.compliance_status)
  const industry = getIndustryLabel(f.naics)
  const srn = extractSRN(f.source_id)
  const programs = (f.programs || '').split(', ').filter(Boolean)
  const triReleases = formatNumber(f.tri_air_releases)
  const ghgReleases = formatNumber(f.ghg_co2_releases)

  return (
    <div className="facility-card" style={{ borderLeftColor: compliance.color }}>
      <div className="card-header">
        <h3 className="card-name">{f.facility_name}</h3>
        <span
          className="card-badge"
          style={{ backgroundColor: compliance.color }}
        >
          {compliance.shortLabel}
        </span>
      </div>

      {industry && <p className="card-industry">{industry}</p>}

      <p className="card-address">
        {f.street}, {f.city}{f.zip ? ` ${f.zip}` : ''} ({f.county} Co.)
      </p>

      <div className="card-details">
        <div className="card-section">
          <h4>Classification</h4>
          <p>{f.classification || 'Unknown'}</p>
        </div>

        {f.recent_violation_count > 0 && (
          <div className="card-section card-violations">
            <h4>Violations</h4>
            <p><strong>{f.recent_violation_count}</strong> recent violation{f.recent_violation_count !== 1 ? 's' : ''}</p>
            {f.violation_pollutants && (
              <p className="card-pollutants">Pollutants: {f.violation_pollutants}</p>
            )}
            {f.last_violation_date && (
              <p>Most recent: {formatDate(f.last_violation_date)}</p>
            )}
            {f.months_with_hpv > 0 && (
              <p>In HPV status for {f.months_with_hpv} month{f.months_with_hpv !== 1 ? 's' : ''}</p>
            )}
            {f.quarters_with_violations > 0 && (
              <p>Quarters with violations: {f.quarters_with_violations}</p>
            )}
          </div>
        )}

        {(f.evaluation_count > 0 || f.last_stack_test_date) && (
          <div className="card-section">
            <h4>Inspections & Testing</h4>
            {f.evaluation_count > 0 && (
              <p>{f.evaluation_count} compliance evaluation{f.evaluation_count !== 1 ? 's' : ''} on record
                {f.last_evaluation_date ? ` (last: ${formatDate(f.last_evaluation_date)})` : ''}</p>
            )}
            {f.last_stack_test_date && (
              <p>Last stack test: {formatDate(f.last_stack_test_date)}
                {f.last_stack_test_result ? ` (${f.last_stack_test_result})` : ''}</p>
            )}
          </div>
        )}

        {(f.formal_action_count > 0 || f.informal_action_count > 0 || parseFloat(f.penalties) > 0) && (
          <div className="card-section">
            <h4>Enforcement</h4>
            {f.formal_action_count > 0 && (
              <p>{f.formal_action_count} formal enforcement action{f.formal_action_count !== 1 ? 's' : ''}</p>
            )}
            {f.informal_action_count > 0 && (
              <p>{f.informal_action_count} informal enforcement action{f.informal_action_count !== 1 ? 's' : ''} (warnings, notices)</p>
            )}
            {parseFloat(f.penalties) > 0 && (
              <p>Penalties: ${parseFloat(f.penalties).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                {f.last_penalty_date ? ` (last assessed: ${formatDate(f.last_penalty_date)})` : ''}</p>
            )}
          </div>
        )}

        {(triReleases || ghgReleases) && (
          <div className="card-section">
            <h4>Reported Emissions</h4>
            {triReleases && <p>Toxic air releases (TRI): {triReleases} lbs/year</p>}
            {ghgReleases && <p>Greenhouse gas (CO2): {ghgReleases} metric tons/year</p>}
          </div>
        )}

        {programs.length > 0 && (
          <div className="card-section">
            <h4>Permits & Programs</h4>
            <ul className="card-programs">
              {programs.map(code => (
                <li key={code}>{PROGRAM_LABELS[code] || code}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="card-links">
        <a
          href={`https://echo.epa.gov/detailed-facility-report?fid=${f.registry_id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Full EPA report &rarr;
        </a>
      </div>
    </div>
  )
}

export default function FacilityList({ facilities, radiusIndex }) {
  if (!facilities || facilities.length === 0) return null

  const radius = RADIUS_PRESETS[radiusIndex]

  // Sort: violations first (HPV, then recent), then by name
  const sorted = [...facilities].sort((a, b) => {
    const order = { 'High Priority Violation': 0, 'Violation w/in 1 Year': 1 }
    const aOrder = order[a.compliance_status] ?? 2
    const bOrder = order[b.compliance_status] ?? 2
    if (aOrder !== bOrder) return aOrder - bOrder
    return a.facility_name.localeCompare(b.facility_name)
  })

  return (
    <div className="facility-list">
      <h2 className="list-title">
        Facility Details ({facilities.length} within {radius.miles} mi)
      </h2>
      <div className="list-cards">
        {sorted.map(f => (
          <FacilityCard key={f.source_id} facility={f} />
        ))}
      </div>
    </div>
  )
}
