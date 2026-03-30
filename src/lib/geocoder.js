const CENSUS_GEOCODER_URL = 'https://geocoding.geo.census.gov/geocoder/locations/onelineaddress'
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'

/**
 * Geocode via Census Bureau (primary). Free, no API key.
 */
async function geocodeCensus(address) {
  const params = new URLSearchParams({
    address,
    benchmark: 'Public_AR_Current',
    format: 'json',
  })

  const response = await fetch(`${CENSUS_GEOCODER_URL}?${params}`)
  if (!response.ok) return null

  const data = await response.json()
  const matches = data.result?.addressMatches

  if (!matches || matches.length === 0) return null

  const match = matches[0]
  const { x: lon, y: lat } = match.coordinates
  const state = match.addressComponents?.state

  return { lat, lon, matchedAddress: match.matchedAddress, state }
}

/**
 * Geocode via OpenStreetMap Nominatim (fallback). Free, no API key.
 * Rate limit: 1 req/sec. We only hit this if Census fails.
 */
async function geocodeNominatim(address) {
  const params = new URLSearchParams({
    q: address,
    format: 'json',
    addressdetails: '1',
    countrycodes: 'us',
    limit: '1',
  })

  const response = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: { 'User-Agent': 'PollutionNearMe/1.0 (planetdetroit.org)' },
  })
  if (!response.ok) return null

  const results = await response.json()
  if (!results || results.length === 0) return null

  const result = results[0]
  const state = result.address?.state_code?.toUpperCase()

  return {
    lat: parseFloat(result.lat),
    lon: parseFloat(result.lon),
    matchedAddress: result.display_name,
    state: state || null,
  }
}

/**
 * Geocode an address. Tries Census Bureau first, falls back to OpenStreetMap.
 * Returns { lat, lon, matchedAddress, state } or null if no match.
 */
export async function geocodeAddress(address) {
  // Try Census first
  try {
    const result = await geocodeCensus(address)
    if (result) return result
  } catch (err) {
    console.warn('Census geocoder failed, trying OpenStreetMap:', err.message)
  }

  // Fall back to Nominatim
  try {
    const result = await geocodeNominatim(address)
    if (result) return result
  } catch (err) {
    console.warn('OpenStreetMap geocoder also failed:', err.message)
  }

  return null
}
