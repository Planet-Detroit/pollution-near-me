import { describe, it, expect } from 'vitest'
import {
  RADIUS_PRESETS,
  DEFAULT_RADIUS_INDEX,
  COMPLIANCE_COLORS,
  PROGRAM_LABELS,
  METRO_DETROIT_CENTER,
  MICHIGAN_CENTER,
} from '../lib/constants'

describe('Constants', () => {
  it('has three radius presets', () => {
    expect(RADIUS_PRESETS).toHaveLength(3)
  })

  it('radius presets have correct mile values', () => {
    expect(RADIUS_PRESETS[0].miles).toBe(0.5)
    expect(RADIUS_PRESETS[1].miles).toBe(1)
    expect(RADIUS_PRESETS[2].miles).toBe(3)
  })

  it('radius presets have meters calculated from miles', () => {
    // 1 mile = 1609.34 meters
    for (const preset of RADIUS_PRESETS) {
      expect(preset.meters).toBeCloseTo(preset.miles * 1609.34, 0)
    }
  })

  it('default radius index points to "My neighborhood" (1 mile)', () => {
    expect(RADIUS_PRESETS[DEFAULT_RADIUS_INDEX].miles).toBe(1)
    expect(RADIUS_PRESETS[DEFAULT_RADIUS_INDEX].label).toBe('My neighborhood')
  })

  it('compliance colors cover all expected statuses', () => {
    expect(COMPLIANCE_COLORS['High Priority Violation'].color).toBe('#dc2626')
    expect(COMPLIANCE_COLORS['Violation w/in 1 Year'].color).toBe('#f97316')
    expect(COMPLIANCE_COLORS['No Violation Identified'].color).toBe('#16a34a')
    expect(COMPLIANCE_COLORS.unknown.color).toBe('#9ca3af')
  })

  it('program labels translate common codes to plain English', () => {
    expect(PROGRAM_LABELS.TVP).toContain('Title V')
    expect(PROGRAM_LABELS.FESOP).toContain('Federally Enforceable')
    expect(PROGRAM_LABELS.MACT).toContain('Maximum Achievable')
  })

  it('Metro Detroit center is in southeast Michigan', () => {
    expect(METRO_DETROIT_CENTER[0]).toBeCloseTo(42.35, 0) // lat
    expect(METRO_DETROIT_CENTER[1]).toBeCloseTo(-83.1, 0) // lon
  })

  it('Michigan center is roughly mid-state', () => {
    expect(MICHIGAN_CENTER[0]).toBeCloseTo(44.3, 0)
    expect(MICHIGAN_CENTER[1]).toBeCloseTo(-84.7, 0)
  })
})
