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
    // NAICS 324110 = Petroleum Refinery
    expect(screen.getByText('Petroleum Refinery')).toBeInTheDocument()
  })

  it('displays compliance status', () => {
    render(<FacilityPopup facility={mockFacility} />)
    expect(screen.getByText('High Priority Violation')).toBeInTheDocument()
  })

  it('displays violation count and pollutants', () => {
    render(<FacilityPopup facility={mockFacility} />)
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('Carbon monoxide, FACIL')).toBeInTheDocument()
  })

  it('displays penalties formatted as currency', () => {
    render(<FacilityPopup facility={mockFacility} />)
    expect(screen.getByText('$250,000')).toBeInTheDocument()
  })

  it('translates program codes to plain English', () => {
    render(<FacilityPopup facility={mockFacility} />)
    // FESOP is the first program listed, shown as its full name
    expect(screen.getByText('Federally Enforceable State Operating Permit')).toBeInTheDocument()
    // Shows "+1 more" since we display max 4 of 5 programs
    expect(screen.getByText(/more/)).toBeInTheDocument()
  })

  it('links to EPA ECHO detail page', () => {
    render(<FacilityPopup facility={mockFacility} />)
    const link = screen.getByText(/View full EPA report/)
    expect(link).toHaveAttribute(
      'href',
      'https://echo.epa.gov/detailed-facility-report?fid=110000000001'
    )
  })

  it('links to EGLE APS permit docs using extracted SRN', () => {
    render(<FacilityPopup facility={mockFacility} />)
    const link = screen.getByText(/EGLE permit docs/)
    expect(link).toHaveAttribute(
      'href',
      'https://www.egle.state.mi.us/aps/downloads/SRN/A9831/'
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
    expect(screen.getByText('No Violations')).toBeInTheDocument()
    expect(screen.queryByText(/Recent violations/)).not.toBeInTheDocument()
  })
})
