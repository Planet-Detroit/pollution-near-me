import { describe, it, expect, vi, beforeEach } from 'vitest'
import { geocodeAddress } from '../lib/geocoder'

const mockFetch = vi.fn()
global.fetch = mockFetch

function nominatimResponse(results) {
  return {
    ok: true,
    json: () => Promise.resolve(results),
  }
}

describe('geocodeAddress', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('returns lat, lon, and matched address for a valid Michigan address', async () => {
    mockFetch.mockResolvedValue(nominatimResponse([{
      lat: '42.278805',
      lon: '-83.153520',
      display_name: '1300, South Fort Street, Delray, Detroit, Wayne County, Michigan, 48217, United States',
      address: { state_code: 'mi' },
    }]))

    const result = await geocodeAddress('1300 Fort St, Detroit, MI 48217')
    expect(result.lat).toBeCloseTo(42.28, 1)
    expect(result.lon).toBeCloseTo(-83.15, 1)
    expect(result.state).toBe('MI')
    expect(result.matchedAddress).toContain('Detroit')
  })

  it('returns null for an unrecognized address', async () => {
    mockFetch.mockResolvedValue(nominatimResponse([]))

    const result = await geocodeAddress('asdfghjkl')
    expect(result).toBeNull()
  })

  it('returns state info for out-of-state addresses', async () => {
    mockFetch.mockResolvedValue(nominatimResponse([{
      lat: '40.748817',
      lon: '-73.985428',
      display_name: '350, 5th Avenue, New York, NY, 10118, United States',
      address: { state_code: 'ny' },
    }]))

    const result = await geocodeAddress('350 5th Ave, New York, NY')
    expect(result.state).toBe('NY')
  })

  it('returns null when geocoder is unavailable', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 503 })

    const result = await geocodeAddress('Detroit, MI')
    expect(result).toBeNull()
  })

  it('returns null when fetch throws', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))

    const result = await geocodeAddress('Detroit, MI')
    expect(result).toBeNull()
  })
})
