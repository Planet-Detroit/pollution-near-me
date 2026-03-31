export default function About() {
  return (
    <div className="about-page">
      <h2>About This Tool</h2>

      <section className="about-section">
        <h3>What this is</h3>
        <p>
          Air Pollution Near Me is a free tool built by{' '}
          <a href="https://planetdetroit.org" target="_blank" rel="noopener noreferrer">Planet Detroit</a>,
          an independent nonprofit newsroom covering environmental and climate issues in Michigan.
          It shows you which facilities near your home are permitted to release air pollutants,
          whether those facilities have been cited for violations, and what pollutants are involved.
        </p>
        <p>
          The tool displays all 3,481 facilities in Michigan that are regulated under the federal
          Clean Air Act. These include power plants, refineries, factories, landfills, and other
          industrial operations that emit pollutants into the air.
        </p>
      </section>

      <section className="about-section">
        <h3>What this is not</h3>
        <p>
          This tool <strong>does not measure the air quality at your location</strong>. It shows
          federal regulatory data &mdash; which facilities have permits, and whether they've been
          cited for violations. Actual air quality at your home depends on many factors including
          wind direction, weather, stack height, and distance.
        </p>
        <p>
          A facility with no violations is not necessarily &ldquo;clean&rdquo; &mdash; it still has
          permits to emit pollutants. In some cases, a facility may never have been inspected. When
          you see &ldquo;No Violations Identified,&rdquo; it means regulators have not cited it for
          violations &mdash; not that the facility has been evaluated and found to be in compliance.
        </p>
        <p>
          <strong>This tool only shows facilities tracked in EPA&rsquo;s federal ECHO database</strong> under
          the Clean Air Act. It does not include:
        </p>
        <ul>
          <li>
            <strong>State-regulated sources</strong> &mdash; Michigan&rsquo;s EGLE regulates many
            additional air pollution sources under state law that don&rsquo;t appear in federal data,
            including fugitive dust sources (asphalt plants, gravel pits, construction sites),
            small commercial operations (dry cleaners, auto body shops), and facilities operating
            under Michigan&rsquo;s{' '}
            <a href="https://www.michigan.gov/egle/about/organization/air-quality/air-permits" target="_blank" rel="noopener noreferrer">
              Rule 290 permit-by-rule exemptions
            </a>
          </li>
          <li>
            <strong>Water pollution sources</strong> (NPDES permits)
          </li>
          <li>
            <strong>Contaminated sites</strong> (Superfund, brownfields)
          </li>
          <li>
            <strong>Hazardous waste facilities</strong> (RCRA)
          </li>
        </ul>
        <p>
          For a broader view of regulated facilities in Michigan, consult{' '}
          <a href="https://www.michigan.gov/egle/about/organization/air-quality" target="_blank" rel="noopener noreferrer">
            EGLE&rsquo;s Air Quality Division
          </a>.
        </p>
      </section>

      <section className="about-section">
        <h3>Where the data comes from</h3>
        <p>
          All facility and compliance data comes from the U.S. Environmental Protection Agency's{' '}
          <a href="https://echo.epa.gov/" target="_blank" rel="noopener noreferrer">
            ECHO (Enforcement and Compliance History Online)
          </a>{' '}
          database, which tracks permits, inspections, violations, and enforcement actions for
          facilities regulated under the Clean Air Act.
        </p>
        <p>
          Our database is updated nightly from EPA ECHO. Address lookups use{' '}
          <a href="https://www.openstreetmap.org/" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>.
        </p>
      </section>

      <section className="about-section">
        <h3>Understanding High Priority Violations</h3>
        <p>
          A High Priority Violation (HPV) is the most serious category of Clean Air Act violation.
          When you see one in this tool, it&rsquo;s important to understand its current status:
        </p>
        <ul>
          <li>
            <strong>Active (red):</strong> The violation has not been addressed. The facility has not yet
            corrected the problem, and enforcement may be ongoing.
          </li>
          <li>
            <strong>Addressed (amber):</strong> Michigan&rsquo;s Department of Environment, Great Lakes,
            and Energy (EGLE) has marked this violation as addressed at the state level. However,
            EPA&rsquo;s federal database has not closed out the HPV record. This is a known data lag:
            EPA&rsquo;s records often trail the state by months or even years. <strong>The majority of
            HPV facilities in Michigan fall into this category.</strong>
          </li>
        </ul>
        <p>
          We distinguish between these statuses using EPA&rsquo;s own <code>AIRHpvStatus</code> field,
          which indicates whether an HPV has been &ldquo;Addressed&rdquo; at the state or federal level.
          This allows us to show you which violations are genuinely active and which have been
          addressed but remain on the federal record.
        </p>
      </section>

      <section className="about-section">
        <h3>A note on data timeliness</h3>
        <p>
          There can be a lag between when a violation occurs and when it appears in EPA's database.
          Michigan's Department of Environment, Great Lakes, and Energy (EGLE) conducts inspections
          and issues violations at the state level, then reports to EPA. This process can take weeks
          or months.
        </p>
        <p>
          EPA has noted data discrepancies between ECHO and Michigan&rsquo;s own records. For the most
          current information about a specific facility, we recommend checking the{' '}
          <a href="https://echo.epa.gov/" target="_blank" rel="noopener noreferrer">
            EPA ECHO facility detail page
          </a>{' '}
          (linked from each facility card) and contacting{' '}
          <a href="https://www.michigan.gov/egle/about/organization/air-quality" target="_blank" rel="noopener noreferrer">
            EGLE&rsquo;s Air Quality Division
          </a>{' '}
          directly.
        </p>
        <p>
          <strong>Facility locations are approximate.</strong> The coordinates in EPA&rsquo;s database
          may reflect a building centroid or general area rather than the exact facility footprint. At
          close zoom levels, a facility&rsquo;s actual location may differ from its marker position by
          several hundred meters.
        </p>
        <p>
          <strong>Emissions data is self-reported.</strong> The toxic air release (TRI) and greenhouse
          gas figures shown on facility cards are reported by the facilities themselves to EPA. They
          are not independently measured or verified.
        </p>
      </section>

      <section className="about-section">
        <h3>How to use this tool</h3>
        <ol>
          <li><strong>Search your address</strong> to see regulated facilities near you</li>
          <li><strong>Look at the colors:</strong> Bright red markers indicate active, unaddressed High Priority
            Violations (the most serious). Amber markers indicate HPVs that have been addressed by the state
            or EPA but remain on EPA&rsquo;s record. Orange markers indicate recent violations. Black markers indicate
            no violations identified.</li>
          <li><strong>Look at the sizes:</strong> Larger circles are Major sources &mdash; facilities with the highest
            emissions potential. Hover over the legend items for definitions.</li>
          <li><strong>Click any marker</strong> for a quick summary, then scroll down for full details
            including violation history, pollutants of concern with health information, enforcement
            actions, and permits</li>
          <li><strong>Adjust the radius</strong> to see more or fewer facilities</li>
          <li><strong>Check the Glossary tab</strong> if you encounter unfamiliar terms</li>
          <li><strong>Share your results</strong> with neighbors, local officials, or on social media</li>
        </ol>
      </section>

      <section className="about-section">
        <h3>What you can do</h3>
        <ul>
          <li>Learn what facilities operate near you and what they are permitted to release</li>
          <li>Attend public hearings when facilities apply for new or renewed permits</li>
          <li>Contact your{' '}
            <a href="https://www.house.mi.gov/MHRPublic/frmFindaRep.aspx" target="_blank" rel="noopener noreferrer">
              state representative
            </a>{' '}
            or{' '}
            <a href="https://www.senate.michigan.gov/fysbyaddress.html" target="_blank" rel="noopener noreferrer">
              state senator
            </a>{' '}
            about air quality concerns in your community
          </li>
          <li>File a complaint with{' '}
            <a href="https://www.michigan.gov/egle/about/contact/pollution-complaints" target="_blank" rel="noopener noreferrer">
              EGLE
            </a>{' '}
            if you observe pollution (odors, visible emissions, dust)
          </li>
          <li>Follow <a href="https://planetdetroit.org" target="_blank" rel="noopener noreferrer">Planet Detroit</a> for
            ongoing environmental reporting in Michigan
          </li>
        </ul>
      </section>

      <section className="about-section">
        <h3>Credits</h3>
        <p>
          This project builds on the pioneering work of data journalist{' '}
          <a href="https://www.shelbyjouppi.com" target="_blank" rel="noopener noreferrer">Shelby Jouppi</a>,
          whose{' '}
          <a href="https://github.com/Planet-Detroit/air-permit-violation-dashboard" target="_blank" rel="noopener noreferrer">
            air permit violation dashboard
          </a>{' '}
          first made Michigan's air quality enforcement data accessible to the public.
        </p>
        <p>
          Built by <a href="https://planetdetroit.org" target="_blank" rel="noopener noreferrer">Planet Detroit</a>.
          Code is open source on{' '}
          <a href="https://github.com/Planet-Detroit/pollution-near-me" target="_blank" rel="noopener noreferrer">GitHub</a>.
        </p>
      </section>

      <section className="about-section">
        <h3>Contact</h3>
        <p>
          Questions, corrections, or feedback? Email us at{' '}
          <a href="mailto:info@planetdetroit.org">info@planetdetroit.org</a>.
        </p>
      </section>
    </div>
  )
}
