import { supabase } from './supabaseClient'

/**
 * Query facilities within a given radius (in meters) of a point.
 * Uses PostGIS ST_DWithin via an RPC function for performance.
 */
export async function queryFacilitiesNearby(lat, lon, radiusMeters) {
  const { data, error } = await supabase.rpc('facilities_within_radius', {
    lat,
    lon,
    radius_meters: radiusMeters,
  })

  if (error) {
    console.error('Supabase query error:', error)
    throw new Error('Failed to query facilities')
  }

  return data || []
}

/**
 * Get the last sync date from the sync_log table.
 */
export async function getLastSyncDate() {
  const { data, error } = await supabase
    .from('air_sync_log')
    .select('synced_at')
    .order('synced_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) return null
  return new Date(data.synced_at)
}

/**
 * Aggregate facility stats for the summary panel.
 */
export function aggregateFacilityStats(facilities) {
  const stats = {
    total: facilities.length,
    operating: 0,
    hpv: 0,
    recentViolation: 0,
    compliant: 0,
    unknown: 0,
    totalPenalties: 0,
    majorSources: 0,
  }

  for (const f of facilities) {
    if (f.air_status === 'Operating') stats.operating++

    switch (f.compliance_status) {
      case 'High Priority Violation':
        stats.hpv++
        break
      case 'Violation w/in 1 Year':
        stats.recentViolation++
        break
      case 'No Violation Identified':
        stats.compliant++
        break
      default:
        stats.unknown++
    }

    if (f.penalties) {
      stats.totalPenalties += parseFloat(f.penalties) || 0
    }

    if (f.classification === 'Major Emissions') {
      stats.majorSources++
    }
  }

  return stats
}
