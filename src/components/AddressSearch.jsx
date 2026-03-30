import { useState, useRef, useEffect } from 'react'
import { geocodeAddress } from '../lib/geocoder'

const PHOTON_URL = 'https://photon.komoot.io/api'

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
        limit: '5',
        lang: 'en',
        lat: '42.35',   // Bias toward Michigan
        lon: '-83.1',
        zoom: '10',
      })

      const resp = await fetch(`${PHOTON_URL}?${params}`)
      if (!resp.ok) return

      const data = await resp.json()
      const results = (data.features || [])
        .filter(f => {
          const props = f.properties || {}
          // Only show US results, preferably Michigan
          return props.country === 'United States'
        })
        .map(f => {
          const p = f.properties || {}
          const parts = [p.name, p.street, p.city, p.state, p.postcode].filter(Boolean)
          return {
            display: parts.join(', '),
            lat: f.geometry?.coordinates?.[1],
            lon: f.geometry?.coordinates?.[0],
            state: p.state === 'Michigan' ? 'MI' : (p.state_code?.toUpperCase() || null),
            city: p.city,
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

    // Debounce autocomplete requests (300ms)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 300)
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
