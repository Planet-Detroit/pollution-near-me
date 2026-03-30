import { useState } from 'react'
import { geocodeAddress } from '../lib/geocoder'

export default function AddressSearch({ onResult, isLoading }) {
  const [address, setAddress] = useState('')
  const [error, setError] = useState(null)
  const [searching, setSearching] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!address.trim() || searching) return

    setError(null)
    setSearching(true)

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
    <form onSubmit={handleSubmit} className="address-search">
      <div className="search-container">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter your address to see pollution sources near you"
          className="search-input"
          disabled={searching || isLoading}
          aria-label="Street address or ZIP code in Michigan"
        />
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
