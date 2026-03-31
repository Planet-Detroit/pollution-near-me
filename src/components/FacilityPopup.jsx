import { NAICS_LABELS, getEffectiveCompliance } from '../lib/constants'
import { parsePollutants } from '../lib/pollutants'

function getIndustryLabel(naics) {
  if (!naics) return null
  const codes = naics.split(/[,\s]+/)
  for (const code of codes) {
    if (NAICS_LABELS[code.trim()]) return NAICS_LABELS[code.trim()]
  }
  return null
}

export default function FacilityPopup({ facility }) {
  const f = facility
  const compliance = getEffectiveCompliance(f)
  const industry = getIndustryLabel(f.naics)
  const pollutants = parsePollutants(f.violation_pollutants)

  return (
    <div className="facility-popup">
      <h3 className="popup-name">{f.facility_name}</h3>

      {industry && <p className="popup-industry">{industry}</p>}

      <p className="popup-address">
        {f.street}, {f.city}
      </p>

      <div className="popup-status" style={{ borderLeftColor: compliance.color }}>
        <strong>{compliance.label}</strong>
        {f.recent_violation_count > 0 && (
          <span> &mdash; {f.recent_violation_count} violation{f.recent_violation_count !== 1 ? 's' : ''}</span>
        )}
      </div>

      {f.compliance_status === 'High Priority Violation' && f.hpv_status?.startsWith('Addressed') && (
        <p className="popup-hpv-note">
          Resolved by {f.hpv_status === 'Addressed-EPA' ? 'EPA' : 'state'} — still on EPA record
        </p>
      )}
      {f.compliance_status === 'High Priority Violation' && f.hpv_status?.startsWith('Unaddressed') && (
        <p className="popup-hpv-note popup-hpv-active">
          Active, unresolved violation
        </p>
      )}

      {pollutants.length > 0 && (
        <p className="popup-pollutant-names">
          {pollutants.map(p => p.info?.name || p.raw).join(', ')}
        </p>
      )}

      <a
        href={`https://echo.epa.gov/detailed-facility-report?fid=${f.registry_id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="popup-epa-link"
      >
        Full EPA report &rarr;
      </a>
    </div>
  )
}
