import { RADIUS_PRESETS } from '../lib/constants'

export default function RadiusSelector({ selectedIndex, onChange }) {
  return (
    <div className="radius-selector">
      <span className="radius-label">Show facilities within:</span>
      <div className="radius-buttons">
        {RADIUS_PRESETS.map((preset, i) => (
          <button
            key={preset.miles}
            onClick={() => onChange(i)}
            className={`radius-button ${i === selectedIndex ? 'active' : ''}`}
            aria-pressed={i === selectedIndex}
          >
            {preset.label}
            <span className="radius-miles">{preset.miles} mi</span>
          </button>
        ))}
      </div>
    </div>
  )
}
