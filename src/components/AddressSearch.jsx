import { useState, useRef, useEffect } from 'react'
import { geocodeAddress } from '../lib/geocoder'

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'

export default function AddressSearch({ onResult, isLoading }) {
  const [address, setAddress] = useState('')
  const [error, setError] = useState(null)
  const [searching, setSearching] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const debounceRef = useRef(null)
  const wrapperRef = useRef(null)

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function fetchSuggestions(query) {
    if (query.length < 3) {
      setSuggestions([])
      return
    }

    try {
      const params = new URLSearchParams({
        q: query,
        format: 'json',
        addressdetails: '1',
        countrycodes: 'us',
        'accept-language': 'en',
        viewbox: '-90.5,41.5,-82.0,48.5', // Michigan bounding box
        bounded: '0', // Prefer Michigan but don't exclude other results
        limit: '5',
      })

      const resp = await fetch(`${NOMINATIM_URL}?${params}`, {
        headers: { 'User-Agent': 'AirPollutionNearMe/1.0 (planetdetroit.org)' },
      })
      if (!resp.ok) return

      const data = await resp.json()
      const results = data
        .filter(r => {
          // Prioritize addresses with house numbers or streets
          const type = r.type || ''
          const cls = r.class || ''
          return cls === 'place' || cls === 'boundary' || cls === 'building'
            || cls === 'highway' || type === 'house' || type === 'residential'
            || r.address?.house_number
        })
        .map(r => {
          const a = r.address || {}
          const stateCode = a.state_code?.toUpperCase() || null
          // Build a clean display string
          const parts = []
          if (a.house_number && a.road) {
            parts.push(`${a.house_number} ${a.road}`)
          } else if (a.road) {
            parts.push(a.road)
          }
          if (a.city || a.town || a.village) parts.push(a.city || a.town || a.village)
          if (a.state) parts.push(a.state)
          if (a.postcode) parts.push(a.postcode)

          return {
            display: parts.length > 0 ? parts.join(', ') : r.display_name,
            lat: parseFloat(r.lat),
            lon: parseFloat(r.lon),
            state: stateCode,
          }
        })

      setSuggestions(results)
      setShowSuggestions(results.length > 0)
      setSelectedIndex(-1)
    } catch (err) {
      // Silently fail — autocomplete is a convenience, not critical
    }
  }

  function handleInputChange(e) {
    const value = e.target.value
    setAddress(value)
    setError(null)

    // Debounce autocomplete requests (400ms, respects Nominatim 1 req/sec policy)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 400)
  }

  function handleKeyDown(e) {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') handleSubmit(e)
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0) {
        selectSuggestion(suggestions[selectedIndex])
      } else {
        handleSubmit(e)
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  function selectSuggestion(suggestion) {
    setAddress(suggestion.display)
    setSuggestions([])
    setShowSuggestions(false)
    setError(null)

    // If the suggestion has coordinates, use them directly
    if (suggestion.lat && suggestion.lon) {
      if (suggestion.state && suggestion.state !== 'MI') {
        setError('This tool covers Michigan. Please enter a Michigan address.')
        return
      }
      onResult({
        lat: suggestion.lat,
        lon: suggestion.lon,
        matchedAddress: suggestion.display,
        state: suggestion.state,
      })
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!address.trim() || searching) return

    setError(null)
    setSearching(true)
    setShowSuggestions(false)

    try {
      const result = await geocodeAddress(address.trim())

      if (!result) {
        setError("We couldn't find that address. Try entering a street address or ZIP code in Michigan.")
        return
      }

      if (result.state && result.state !== 'MI') {
        setError('This tool covers Michigan. Please enter a Michigan address.')
        return
      }

      onResult(result)
    } catch (err) {
      setError('Address lookup service is temporarily unavailable. Please try again.')
      console.error('Geocoding error:', err)
    } finally {
      setSearching(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="address-search" ref={wrapperRef}>
      <div className="search-container">
        <div className="search-input-wrapper">
          <input
            type="text"
            value={address}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Enter your address to see pollution sources near you"
            className="search-input"
            disabled={searching || isLoading}
            aria-label="Street address or ZIP code in Michigan"
            autoComplete="off"
            role="combobox"
            aria-expanded={showSuggestions}
            aria-autocomplete="list"
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="search-suggestions" role="listbox">
              {suggestions.map((s, i) => (
                <li
                  key={i}
                  role="option"
                  aria-selected={i === selectedIndex}
                  className={`search-suggestion ${i === selectedIndex ? 'selected' : ''}`}
                  onMouseDown={() => selectSuggestion(s)}
                  onMouseEnter={() => setSelectedIndex(i)}
                >
                  {s.display}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="submit"
          className="search-button"
          disabled={searching || isLoading || !address.trim()}
        >
          {searching ? 'Searching...' : 'Search'}
        </button>
      </div>
      {error && (
        <p className="search-error" role="alert">{error}</p>
      )}
    </form>
  )
}
