import { supabase } from './supabaseClient'

/**
 * Fetch ALL Michigan facilities (for initial map display).
 * Only fetches the columns needed for map markers, not full detail.
 * Paginates in batches of 1000 since Supabase has a default row limit.
 */
export async function queryAllFacilities() {
  const PAGE_SIZE = 1000
  let allData = []
  let from = 0

  while (true) {
    const { data, error } = await supabase
      .from('air_facilities')
      .select('source_id,facility_name,lat,lon,compliance_status,hpv_status,classification,air_status')
      .range(from, from + PAGE_SIZE - 1)

    if (error) {
      console.error('Supabase query error:', error)
      throw new Error('Failed to query facilities')
    }

    if (!data || data.length === 0) break

    allData = allData.concat(data)

    // If we got fewer rows than the page size, we've reached the end
    if (data.length < PAGE_SIZE) break

    from += PAGE_SIZE
  }

  return allData
}

/**
 * Query facilities within a given radius (in meters) of a point.
 * Returns full detail for the nearby facilities.
 */
export async function queryFacilitiesNearby(lat, lon, radiusMeters) {
  const { data, error } = await supabase.rpc('facilities_within_radius', {
    p_lat: lat,
    p_lon: lon,
    radius_meters: radiusMeters,
  })

  if (error) {
    console.error('Supabase query error:', error)
    throw new Error('Failed to query facilities')
  }

  return data || []
}

/**
 * Fetch regulated pollutants for a list of source_ids.
 * Returns a map: source_id -> [{ pollutant_desc, cas_number }]
 */
export async function queryPollutantsForFacilities(sourceIds) {
  if (!sourceIds || sourceIds.length === 0) return {}

  const { data, error } = await supabase
    .from('air_facility_pollutants')
    .select('source_id, pollutant_desc, cas_number')
    .in('source_id', sourceIds)

  if (error) {
    console.error('Pollutant query error:', error)
    return {}
  }

  // Group by source_id
  const map = {}
  for (const row of data || []) {
    if (!map[row.source_id]) map[row.source_id] = []
    map[row.source_id].push({
      pollutant_desc: row.pollutant_desc,
      cas_number: row.cas_number,
    })
  }
  return map
}

/**
 * Fetch full detail for a single facility by source_id.
 */
export async function queryFacilityBySourceId(sourceId) {
  const { data, error } = await supabase
    .from('air_facilities')
    .select('*')
    .eq('source_id', sourceId)
    .single()

  if (error) {
    console.error('Facility detail query error:', error)
    return null
  }

  return data
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
    hpvActive: 0,
    hpvAddressed: 0,
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
        if (f.hpv_status && f.hpv_status.startsWith('Addressed')) {
          stats.hpvAddressed++
        } else {
          stats.hpvActive++
        }
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
