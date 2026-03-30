import { describe, it, expect, vi, beforeEach } from 'vitest'
import { geocodeAddress } from '../lib/geocoder'

const mockFetch = vi.fn()
global.fetch = mockFetch

function censusMockResponse(matches) {
  return {
    ok: true,
    json: () => Promise.resolve({ result: { addressMatches: matches } }),
  }
}

function nominatimMockResponse(results) {
  return {
    ok: true,
    json: () => Promise.resolve(results),
  }
}

describe('geocodeAddress', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('returns lat, lon, and matched address from Census geocoder', async () => {
    mockFetch.mockResolvedValue(censusMockResponse([{
      coordinates: { x: -83.15, y: 42.27 },
      matchedAddress: '1300 S FORT ST, DETROIT, MI, 48217',
      addressComponents: { state: 'MI' },
    }]))

    const result = await geocodeAddress('1300 Fort St, Detroit, MI 48217')
    expect(result).toEqual({
      lat: 42.27,
      lon: -83.15,
      matchedAddress: '1300 S FORT ST, DETROIT, MI, 48217',
      state: 'MI',
    })
  })

  it('falls back to Nominatim when Census returns no matches', async () => {
    // First call (Census) returns no matches
    mockFetch.mockResolvedValueOnce(censusMockResponse([]))
    // Second call (Nominatim) returns a result
    mockFetch.mockResolvedValueOnce(nominatimMockResponse([{
      lat: '42.27',
      lon: '-83.15',
      display_name: '1300, South Fort Street, Detroit, Wayne County, Michigan, 48217, US',
      address: { state_code: 'mi' },
    }]))

    const result = await geocodeAddress('1300 Fort St, Detroit, MI 48217')
    expect(result.lat).toBeCloseTo(42.27)
    expect(result.lon).toBeCloseTo(-83.15)
    expect(result.state).toBe('MI')
  })

  it('falls back to Nominatim when Census errors', async () => {
    // Census fails
    mockFetch.mockResolvedValueOnce({ ok: false, status: 503 })
    // Nominatim succeeds
    mockFetch.mockResolvedValueOnce(nominatimMockResponse([{
      lat: '42.27',
      lon: '-83.15',
      display_name: 'Detroit, MI',
      address: { state_code: 'mi' },
    }]))

    const result = await geocodeAddress('Detroit, MI')
    expect(result).not.toBeNull()
    expect(result.state).toBe('MI')
  })

  it('returns null when both geocoders find nothing', async () => {
    mockFetch.mockResolvedValueOnce(censusMockResponse([]))
    mockFetch.mockResolvedValueOnce(nominatimMockResponse([]))

    const result = await geocodeAddress('asdfghjkl')
    expect(result).toBeNull()
  })

  it('returns state info for out-of-state addresses', async () => {
    mockFetch.mockResolvedValue(censusMockResponse([{
      coordinates: { x: -73.98, y: 40.75 },
      matchedAddress: '350 5TH AVE, NEW YORK, NY 10118',
      addressComponents: { state: 'NY' },
    }]))

    const result = await geocodeAddress('350 5th Ave, New York, NY')
    expect(result.state).toBe('NY')
  })
})
