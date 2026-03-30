import { describe, it, expect, vi, beforeEach } from 'vitest'
import { geocodeAddress } from '../lib/geocoder'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('geocodeAddress', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('returns lat, lon, and matched address for a valid Michigan address', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        result: {
          addressMatches: [{
            coordinates: { x: -83.15, y: 42.27 },
            matchedAddress: '1300 FORT ST, DETROIT, MI 48217',
            addressComponents: { state: 'MI' },
          }],
        },
      }),
    })

    const result = await geocodeAddress('1300 Fort St, Detroit, MI 48217')
    expect(result).toEqual({
      lat: 42.27,
      lon: -83.15,
      matchedAddress: '1300 FORT ST, DETROIT, MI 48217',
      state: 'MI',
    })
  })

  it('returns null for an unrecognized address', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        result: { addressMatches: [] },
      }),
    })

    const result = await geocodeAddress('asdfghjkl')
    expect(result).toBeNull()
  })

  it('returns state info for out-of-state addresses', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        result: {
          addressMatches: [{
            coordinates: { x: -73.98, y: 40.75 },
            matchedAddress: '350 5TH AVE, NEW YORK, NY 10118',
            addressComponents: { state: 'NY' },
          }],
        },
      }),
    })

    const result = await geocodeAddress('350 5th Ave, New York, NY')
    expect(result.state).toBe('NY')
  })

  it('throws when geocoding service is unavailable', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 503 })

    await expect(geocodeAddress('some address'))
      .rejects.toThrow('Geocoding service unavailable')
  })
})
