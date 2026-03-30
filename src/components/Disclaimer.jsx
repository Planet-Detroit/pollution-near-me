export default function Disclaimer() {
  return (
    <div className="disclaimer">
      <p>
        This tool shows regulatory data from the{' '}
        <a href="https://echo.epa.gov/" target="_blank" rel="noopener noreferrer">
          EPA ECHO database
        </a>.
        It does not measure actual air quality at your location. Actual exposure
        depends on weather, terrain, stack height, and other factors. Always verify
        details using the linked EPA facility reports.
      </p>
    </div>
  )
}
