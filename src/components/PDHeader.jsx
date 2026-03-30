/**
 * Planet Detroit Standard Dashboard Header
 *
 * Props:
 *   title       - Dashboard/tool name (e.g., "Pollution Near Me")
 *   subtitle    - Optional one-line description
 *   showDonate  - Show the Donate button (default: true)
 *   partnerLogo - Optional URL to a partner/co-branded logo
 *   partnerName - Alt text for partner logo
 *   partnerUrl  - Link for partner logo
 */
export default function PDHeader({
  title,
  subtitle,
  showDonate = true,
  partnerLogo,
  partnerName,
  partnerUrl,
}) {
  return (
    <header className="pd-header">
      <div className="pd-header-inner">
        <div className="pd-header-logos">
          <a
            href="https://planetdetroit.org"
            target="_blank"
            rel="noopener noreferrer"
            className="pd-logo-link"
          >
            <img
              src="https://planetdetroit.org/wp-content/uploads/2025/08/Asset-2@4x0424.png"
              alt="Planet Detroit"
              className="pd-logo"
            />
          </a>
          {partnerLogo && (
            <>
              <span className="pd-logo-divider">&times;</span>
              <a
                href={partnerUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="pd-logo-link"
              >
                <img
                  src={partnerLogo}
                  alt={partnerName || 'Partner'}
                  className="pd-partner-logo"
                />
              </a>
            </>
          )}
        </div>

        <div className="pd-header-content">
          <h1 className="pd-header-title">{title}</h1>
          {subtitle && <p className="pd-header-subtitle">{subtitle}</p>}
        </div>

        {showDonate && (
          <a
            href="https://donorbox.org/be-a-planet-detroiter-780440"
            target="_blank"
            rel="noopener noreferrer"
            className="pd-donate-button"
          >
            Donate
          </a>
        )}
      </div>
    </header>
  )
}
