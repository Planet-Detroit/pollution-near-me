import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import FacilityPopup from '../components/FacilityPopup'

const mockFacility = {
  source_id: 'MI00000000000A9831',
  registry_id: '110000000001',
  facility_name: 'MARATHON PETROLEUM COMPANY LP',
  street: '1300 S FORT ST',
  city: 'DETROIT',
  county: 'Wayne',
  zip: '48217',
  lat: 42.28,
  lon: -83.15,
  programs: 'FESOP, MACT, NSR, SIP, TVP',
  naics: '324110',
  air_status: 'Operating',
  classification: 'Major Emissions',
  compliance_status: 'High Priority Violation',
  hpv_status: 'Addressed-State',
  recent_violation_count: 3,
  violation_pollutants: 'Carbon monoxide, FACIL',
  last_violation_date: '2025-06-15',
  penalties: 250000,
}

describe('FacilityPopup', () => {
  it('displays facility name', () => {
    render(<FacilityPopup facility={mockFacility} />)
    expect(screen.getByText('MARATHON PETROLEUM COMPANY LP')).toBeInTheDocument()
  })

  it('displays industry label from NAICS code', () => {
    render(<FacilityPopup facility={mockFacility} />)
    expect(screen.getByText('Petroleum Refinery')).toBeInTheDocument()
  })

  it('displays compliance status and violation count', () => {
    render(<FacilityPopup facility={mockFacility} />)
    expect(screen.getByText('High Priority Violation (Addressed)')).toBeInTheDocument()
    expect(screen.getByText(/3 violation/)).toBeInTheDocument()
  })

  it('shows pollutant names in plain English (FACIL filtered out)', () => {
    render(<FacilityPopup facility={mockFacility} />)
    expect(screen.getByText('Carbon Monoxide (CO)')).toBeInTheDocument()
    expect(screen.queryByText('FACIL')).not.toBeInTheDocument()
  })

  it('shows address', () => {
    render(<FacilityPopup facility={mockFacility} />)
    expect(screen.getByText('1300 S FORT ST, DETROIT')).toBeInTheDocument()
  })

  it('links to EPA ECHO detail page', () => {
    render(<FacilityPopup facility={mockFacility} />)
    const link = screen.getByText(/Full EPA report/)
    expect(link).toHaveAttribute(
      'href',
      'https://echo.epa.gov/detailed-facility-report?fid=110000000001'
    )
  })

  it('handles facility with no violations', () => {
    const clean = {
      ...mockFacility,
      compliance_status: 'No Violation Identified',
      recent_violation_count: 0,
      violation_pollutants: '',
      penalties: 0,
    }
    render(<FacilityPopup facility={clean} />)
    expect(screen.getByText('No Violations Identified')).toBeInTheDocument()
    expect(screen.queryAllByText(/violation/i)).toHaveLength(1) // just the status label
  })
})
