import { describe, it, expect } from 'vitest'
import { aggregateFacilityStats } from '../lib/facilities'

const mockFacilities = [
  {
    source_id: 'MI001',
    facility_name: 'Major Polluter',
    air_status: 'Operating',
    compliance_status: 'High Priority Violation',
    classification: 'Major Emissions',
    penalties: '500000',
  },
  {
    source_id: 'MI002',
    facility_name: 'Recent Violator',
    air_status: 'Operating',
    compliance_status: 'Violation w/in 1 Year',
    classification: 'Minor Emissions',
    penalties: '10000',
  },
  {
    source_id: 'MI003',
    facility_name: 'Good Facility',
    air_status: 'Operating',
    compliance_status: 'No Violation Identified',
    classification: 'Minor Emissions',
    penalties: null,
  },
  {
    source_id: 'MI004',
    facility_name: 'Closed Facility',
    air_status: 'Permanently Closed',
    compliance_status: '',
    classification: 'Minor Emissions',
    penalties: null,
  },
]

describe('aggregateFacilityStats', () => {
  it('counts total facilities', () => {
    const stats = aggregateFacilityStats(mockFacilities)
    expect(stats.total).toBe(4)
  })

  it('counts operating facilities', () => {
    const stats = aggregateFacilityStats(mockFacilities)
    expect(stats.operating).toBe(3)
  })

  it('counts HPV facilities', () => {
    const stats = aggregateFacilityStats(mockFacilities)
    expect(stats.hpv).toBe(1)
  })

  it('counts recent violations', () => {
    const stats = aggregateFacilityStats(mockFacilities)
    expect(stats.recentViolation).toBe(1)
  })

  it('counts compliant facilities', () => {
    const stats = aggregateFacilityStats(mockFacilities)
    expect(stats.compliant).toBe(1)
  })

  it('counts unknown/empty status as unknown', () => {
    const stats = aggregateFacilityStats(mockFacilities)
    expect(stats.unknown).toBe(1)
  })

  it('sums penalties correctly', () => {
    const stats = aggregateFacilityStats(mockFacilities)
    expect(stats.totalPenalties).toBe(510000)
  })

  it('counts major sources', () => {
    const stats = aggregateFacilityStats(mockFacilities)
    expect(stats.majorSources).toBe(1)
  })

  it('handles empty facility list', () => {
    const stats = aggregateFacilityStats([])
    expect(stats.total).toBe(0)
    expect(stats.hpv).toBe(0)
    expect(stats.totalPenalties).toBe(0)
  })
})
