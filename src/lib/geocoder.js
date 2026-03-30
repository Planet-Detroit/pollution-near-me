const CENSUS_GEOCODER_URL = 'https://geocoding.geo.census.gov/geocoder/addresses/onelineaddress'

/**
 * Geocode an address using the Census Bureau geocoder (free, no API key needed).
 * Returns { lat, lon, matchedAddress } or null if no match.
 */
export async function geocodeAddress(address) {
  const params = new URLSearchParams({
    address,
    benchmark: 'Public_AR_Current',
    format: 'json',
  })

  const response = await fetch(`${CENSUS_GEOCODER_URL}?${params}`)
  if (!response.ok) {
    throw new Error('Geocoding service unavailable')
  }

  const data = await response.json()
  const matches = data.result?.addressMatches

  if (!matches || matches.length === 0) {
    return null
  }

  const match = matches[0]
  const { x: lon, y: lat } = match.coordinates
  const state = match.addressComponents?.state

  return {
    lat,
    lon,
    matchedAddress: match.matchedAddress,
    state,
  }
}
