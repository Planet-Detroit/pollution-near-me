import { COMPLIANCE_COLORS, PROGRAM_LABELS, NAICS_LABELS } from '../lib/constants'

function getComplianceInfo(status) {
  return COMPLIANCE_COLORS[status] || COMPLIANCE_COLORS.unknown
}

function translatePrograms(programString) {
  if (!programString) return []
  return programString.split(', ').map(code => ({
    code,
    label: PROGRAM_LABELS[code] || code,
  }))
}

function getIndustryLabel(naics) {
  if (!naics) return null
  // NAICS field can contain multiple codes separated by commas/spaces
  const codes = naics.split(/[,\s]+/)
  for (const code of codes) {
    if (NAICS_LABELS[code.trim()]) return NAICS_LABELS[code.trim()]
  }
  return null
}

function extractSRN(sourceId) {
  // ECHO SourceID format: MI00000000000A9831 -> SRN: A9831
  if (!sourceId || !sourceId.startsWith('MI')) return null
  return sourceId.replace(/^MI0+/, '')
}

export default function FacilityPopup({ facility }) {
  const f = facility
  const compliance = getComplianceInfo(f.compliance_status)
  const programs = translatePrograms(f.programs)
  const industry = getIndustryLabel(f.naics)
  const srn = extractSRN(f.source_id)

  return (
    <div className="facility-popup">
      <h3 className="popup-name">{f.facility_name}</h3>

      {industry && <p className="popup-industry">{industry}</p>}

      <p className="popup-address">
        {f.street}{f.city ? `, ${f.city}` : ''}{f.county ? ` (${f.county} Co.)` : ''}
      </p>

      <div className="popup-compliance" style={{ borderLeftColor: compliance.color }}>
        <span className="compliance-label">{compliance.label}</span>
      </div>

      {f.classification && (
        <p className="popup-field">
          <span className="field-label">Classification:</span> {f.classification}
        </p>
      )}

      {f.recent_violation_count > 0 && (
        <div className="popup-violations">
          <p className="popup-field">
            <span className="field-label">Recent violations:</span> {f.recent_violation_count}
          </p>
          {f.violation_pollutants && (
            <p className="popup-field">
              <span className="field-label">Pollutants:</span> {f.violation_pollutants}
            </p>
          )}
          {f.last_violation_date && (
            <p className="popup-field">
              <span className="field-label">Most recent:</span>{' '}
              {new Date(f.last_violation_date).toLocaleDateString('en-US')}
            </p>
          )}
        </div>
      )}

      {f.penalties > 0 && (
        <p className="popup-field">
          <span className="field-label">Penalties:</span>{' '}
          ${parseFloat(f.penalties).toLocaleString('en-US', { maximumFractionDigits: 0 })}
        </p>
      )}

      {programs.length > 0 && (
        <div className="popup-programs">
          <span className="field-label">Permits:</span>
          <ul>
            {programs.slice(0, 4).map(p => (
              <li key={p.code} title={p.label}>{p.label}</li>
            ))}
            {programs.length > 4 && <li>+{programs.length - 4} more</li>}
          </ul>
        </div>
      )}

      <div className="popup-links">
        <a
          href={`https://echo.epa.gov/detailed-facility-report?fid=${f.registry_id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          View full EPA report &rarr;
        </a>
      </div>
    </div>
  )
}
