const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'

/**
 * Geocode via OpenStreetMap Nominatim. Free, no API key, CORS-friendly.
 * Rate limit: 1 req/sec.
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
 * Geocode an address using OpenStreetMap Nominatim.
 * Returns { lat, lon, matchedAddress, state } or null if no match.
 *
 * Note: Census Bureau geocoder doesn't support CORS for browser requests,
 * so we use Nominatim as the primary geocoder. If a server-side proxy is
 * added later, Census can be re-added as a secondary option.
 */
export async function geocodeAddress(address) {
  try {
    return await geocodeNominatim(address)
  } catch (err) {
    console.warn('Geocoding failed:', err.message)
    return null
  }
}
