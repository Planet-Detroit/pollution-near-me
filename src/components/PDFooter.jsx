/**
 * Planet Detroit Standard Dashboard Footer
 *
 * Props:
 *   toolName    - Name of this dashboard/tool
 *   toolCredits - Optional additional credits (e.g., "Built by Shelby Jouppi")
 */
export default function PDFooter({ toolName, toolCredits }) {
  const year = new Date().getFullYear()

  return (
    <footer className="pd-footer">
      <div className="pd-footer-inner">
        <div className="pd-footer-brand">
          <img
            src="https://planetdetroit.org/wp-content/uploads/2024/07/cropped-PlanetDetroitLogo-WhiteText-2.png"
            alt="Planet Detroit"
            className="pd-footer-logo"
          />
          <p className="pd-footer-mission">
            Rooted in Detroit. Independent environmental and climate journalism.
          </p>
        </div>

        <div className="pd-footer-links">
          <a href="https://planetdetroit.org" target="_blank" rel="noopener noreferrer">
            planetdetroit.org
          </a>
          <a href="https://www.instagram.com/planetdetroitnews" target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
          <a href="https://bsky.app/profile/planetdetroit.bsky.social" target="_blank" rel="noopener noreferrer">
            Bluesky
          </a>
          <a href="https://www.facebook.com/planetdetroitnews" target="_blank" rel="noopener noreferrer">
            Facebook
          </a>
        </div>

        <div className="pd-footer-meta">
          {toolCredits && <p className="pd-footer-credits">{toolCredits}</p>}
          <p className="pd-footer-copyright">
            &copy; {year} Planet Detroit{toolName ? ` | ${toolName}` : ''}
          </p>
        </div>
      </div>
    </footer>
  )
}
