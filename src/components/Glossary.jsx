import { useState } from 'react'

const TERMS = [
  {
    term: 'Major Emissions',
    definition: 'A facility that emits or has the potential to emit 100 tons per year or more of any regulated air pollutant, or 10+ tons per year of a single hazardous air pollutant, or 25+ tons per year of combined hazardous air pollutants. These are the largest pollution sources and face the strictest regulations.',
  },
  {
    term: 'Synthetic Minor Emissions',
    definition: 'A facility that could qualify as a Major source based on its equipment, but has voluntarily accepted permit limits that keep its emissions below the Major source thresholds. Also called "80% Synthetic Minor" when limits are set at 80% of the Major threshold.',
  },
  {
    term: 'Minor Emissions',
    definition: 'A facility whose actual and potential emissions are below Major source thresholds. These face less stringent permitting requirements but are still regulated.',
  },
  {
    term: 'High Priority Violation (HPV)',
    definition: 'The most serious type of Clean Air Act violation. Includes exceeding emission limits, operating without a required permit, or failing to meet compliance schedules. HPVs are tracked at the federal level and can trigger formal enforcement action. An HPV can be "Unaddressed" (active — the issue has not yet been addressed) or "Addressed" (the state or EPA has marked the issue as addressed, but the HPV designation remains on the federal record). In Michigan, the majority of HPV facilities have an "Addressed" status.',
  },
  {
    term: 'Title V (Major Source) Permit',
    definition: 'A comprehensive operating permit required for all Major sources under the Clean Air Act. Consolidates all air quality requirements for a facility into one document. Must be renewed every 5 years.',
  },
  {
    term: 'State Implementation Plan (SIP)',
    definition: 'Michigan\'s plan for meeting federal air quality standards (NAAQS). Facilities subject to SIP rules must comply with state-specific emission limits and operating requirements.',
  },
  {
    term: 'New Source Review (NSR)',
    definition: 'A permitting program that requires facilities to obtain permits before building new emission sources or making major modifications to existing ones. Ensures new pollution sources use modern control technology.',
  },
  {
    term: 'Maximum Achievable Control Technology (MACT)',
    definition: 'The strictest emission standards for hazardous air pollutants (like benzene, formaldehyde, or mercury). Based on the best-performing facilities in each industry. Applies to Major sources of hazardous air pollutants.',
  },
  {
    term: 'New Source Performance Standards (NSPS)',
    definition: 'Federal emission standards for new or modified facilities in specific industrial categories (power plants, refineries, cement plants, etc.). Sets a minimum performance floor nationwide.',
  },
  {
    term: 'National Emission Standards for Hazardous Air Pollutants (NESHAP)',
    definition: 'Federal standards specifically targeting hazardous air pollutants — chemicals known or suspected to cause cancer, birth defects, or other serious health effects. Includes substances like benzene, asbestos, and mercury.',
  },
  {
    term: 'Prevention of Significant Deterioration (PSD)',
    definition: 'A permitting program for new Major sources or major modifications in areas that already meet air quality standards. Ensures that clean air areas don\'t degrade to just barely meeting standards.',
  },
  {
    term: 'Federally Enforceable State Operating Permit (FESOP)',
    definition: 'A state-issued permit for facilities that are not Major sources but still need federally enforceable emission limits. Often used by Synthetic Minor sources to keep their emissions below Major source thresholds.',
  },
  {
    term: 'Generally Available Control Technology (GACT)',
    definition: 'A less stringent alternative to MACT for smaller (area) sources of hazardous air pollutants. Based on generally available control methods rather than the best-performing facilities.',
  },
  {
    term: 'Greenhouse Gas Reporting (GHG)',
    definition: 'Facilities that emit 25,000 metric tons or more of CO2-equivalent greenhouse gases per year must report their emissions to the EPA.',
  },
  {
    term: 'FACIL',
    definition: 'When "FACIL" appears as a violation pollutant, it means the violation is facility-wide (such as a recordkeeping, reporting, or monitoring violation) rather than tied to a specific pollutant emission.',
  },
  {
    term: 'Stack Test',
    definition: 'A physical measurement of pollutant emissions from a smokestack or vent. Conducted by certified testers to verify that a facility\'s actual emissions comply with permit limits. Results of "Pass" or "Fail" are reported to regulators.',
  },
  {
    term: 'Compliance Evaluation',
    definition: 'An on-site inspection by EPA or state regulators to assess whether a facility is following its permit conditions and air quality regulations.',
  },
  {
    term: 'Cumulative Impacts',
    definition: 'The totality of exposures to combinations of chemical and nonchemical stressors and their effects on health, well-being, and quality of life. Cumulative impacts consider not just a single facility or pollutant, but the combined burden of multiple pollution sources, environmental conditions, and social factors (like poverty or lack of healthcare access) that affect a community over time. A neighborhood near both a refinery and a highway, for example, may face greater health risks than either source alone would suggest.',
  },
  {
    term: 'Formal Enforcement Action',
    definition: 'A legal action taken against a facility for violations, such as a consent order, administrative penalty, or court filing. More serious than informal actions.',
  },
  {
    term: 'Informal Enforcement Action',
    definition: 'A preliminary regulatory response to a violation, such as a warning letter, notice of violation, or compliance advisory. Does not carry legal penalties but signals that regulators have identified a problem.',
  },
  {
    term: 'TRI Air Releases',
    definition: 'The total pounds of toxic chemicals released into the air as reported to the EPA\'s Toxics Release Inventory. Facilities that manufacture, process, or use certain toxic chemicals above threshold quantities must report annually.',
  },
]

export default function Glossary() {
  const [expandedTerm, setExpandedTerm] = useState(null)

  return (
    <div className="glossary">
      <div className="glossary-content">
        <h2 className="glossary-title">Glossary of Terms</h2>
        <p className="glossary-intro">
          Understanding air quality regulations can be confusing. Here's what the terms in this tool mean.
        </p>
        <dl className="glossary-list">
          {TERMS.map(({ term, definition }) => (
            <div
              key={term}
              className={`glossary-item ${expandedTerm === term ? 'expanded' : ''}`}
            >
              <dt
                className="glossary-term"
                onClick={() => setExpandedTerm(expandedTerm === term ? null : term)}
              >
                {term}
                <span className="glossary-expand">{expandedTerm === term ? '\u2212' : '+'}</span>
              </dt>
              {expandedTerm === term && (
                <dd className="glossary-definition">{definition}</dd>
              )}
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
