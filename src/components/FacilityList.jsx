import {
  NAICS_LABELS,
  RADIUS_PRESETS,
  getProgramLabel,
  getProgramUrl,
  getEffectiveCompliance,
} from '../lib/constants'
import { parsePollutants, getPollutantInfo } from '../lib/pollutants'

// getEffectiveCompliance imported from constants handles HPV addressed/unaddressed distinction

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

function FacilityCard({ facility, regulatedPollutants }) {
  const f = facility
  const compliance = getEffectiveCompliance(f)
  const industry = getIndustryLabel(f.naics)
  const programs = (f.programs || '').split(', ').filter(Boolean)
  const pollutants = parsePollutants(f.violation_pollutants)
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
            {f.last_violation_date && (
              <p>Most recent: {formatDate(f.last_violation_date)}</p>
            )}
            {f.months_with_hpv > 0 && (
              <p>In High Priority Violation status for {f.months_with_hpv} month{f.months_with_hpv !== 1 ? 's' : ''}</p>
            )}
            {f.compliance_status === 'High Priority Violation' && f.hpv_status?.startsWith('Addressed') && (
              <p className="hpv-addressed-note">
                This violation has been addressed by {f.hpv_status === 'Addressed-EPA' ? 'EPA' : 'the state (EGLE)'},
                but the HPV designation remains on EPA&rsquo;s federal record.
              </p>
            )}
            {f.compliance_status === 'High Priority Violation' && f.hpv_status?.startsWith('Unaddressed') && (
              <p className="hpv-active-note">
                This is an active, unaddressed High Priority Violation &mdash; the most serious category of Clean Air Act violation.
              </p>
            )}
          </div>
        )}

        {pollutants.length > 0 && (
          <div className="card-section">
            <h4>Pollutants of Concern</h4>
            <div className="card-pollutant-list">
              {pollutants.map(({ raw, info }) => (
                <div key={raw} className="card-pollutant-item">
                  <p className="pollutant-name">{info?.name || raw}</p>
                  {info?.health && (
                    <p className="pollutant-health">{info.health}</p>
                  )}
                  {info?.sources && (
                    <p className="pollutant-sources"><span className="field-label">Common sources:</span> {info.sources}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {regulatedPollutants && regulatedPollutants.length > 0 && (
          <div className="card-section">
            <h4>Regulated Pollutants</h4>
            <p className="regulated-pollutants-note">This facility is permitted to emit:</p>
            <div className="regulated-pollutants-list">
              {regulatedPollutants.map(p => {
                const info = getPollutantInfo(p.pollutant_desc)
                return (
                  <div key={p.pollutant_desc} className="regulated-pollutant-item">
                    <span className="regulated-pollutant-name">{info?.name || p.pollutant_desc}</span>
                    {info?.health && (
                      <span className="regulated-pollutant-health">{info.health}</span>
                    )}
                  </div>
                )
              })}
            </div>
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
              {programs.map(code => {
                const label = getProgramLabel(code)
                const url = getProgramUrl(code)
                return (
                  <li key={code}>
                    {url ? (
                      <a href={url} target="_blank" rel="noopener noreferrer">{label}</a>
                    ) : label}
                  </li>
                )
              })}
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

export default function FacilityList({ facilities, radiusIndex, pollutantMap, title, onDismiss }) {
  if (!facilities || facilities.length === 0) return null

  const radius = RADIUS_PRESETS[radiusIndex]

  // Sort: active HPV first, then addressed HPV, then recent violations, then by name
  const sorted = [...facilities].sort((a, b) => {
    function sortKey(f) {
      if (f.compliance_status === 'High Priority Violation') {
        return f.hpv_status?.startsWith('Addressed') ? 1 : 0
      }
      if (f.compliance_status === 'Violation w/in 1 Year') return 2
      return 3
    }
    const diff = sortKey(a) - sortKey(b)
    if (diff !== 0) return diff
    return a.facility_name.localeCompare(b.facility_name)
  })

  return (
    <div className="facility-list">
      <h2 className="list-title">
        {title || `Facility Details (${facilities.length} within ${radius.miles} mi)`}
        {onDismiss && (
          <button className="dismiss-selected" onClick={onDismiss} aria-label="Dismiss">
            &times;
          </button>
        )}
      </h2>
      <div className="list-cards">
        {sorted.map(f => (
          <FacilityCard key={f.source_id} facility={f} regulatedPollutants={pollutantMap?.[f.source_id]} />
        ))}
      </div>
    </div>
  )
}
