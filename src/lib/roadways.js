/**
 * Check if a point (lat, lon) falls within the road buffer GeoJSON.
 * Uses ray-casting point-in-polygon test.
 */

let cachedBufferData = null

export async function loadRoadBuffers() {
  if (cachedBufferData) return cachedBufferData
  const resp = await fetch('/mi-road-buffers-500m.geojson')
  cachedBufferData = await resp.json()
  return cachedBufferData
}

/**
 * Check if a point is within any road buffer polygon.
 * Returns true/false.
 */
export async function isNearMajorRoad(lat, lon) {
  try {
    const data = await loadRoadBuffers()
    const point = [lon, lat] // GeoJSON uses [lon, lat]

    for (const feature of data.features) {
      if (pointInGeometry(point, feature.geometry)) {
        return true
      }
    }
    return false
  } catch (err) {
    console.warn('Road proximity check failed:', err)
    return false
  }
}

function pointInGeometry(point, geometry) {
  if (geometry.type === 'Polygon') {
    return pointInPolygon(point, geometry.coordinates)
  }
  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.some(poly => pointInPolygon(point, poly))
  }
  return false
}

function pointInPolygon(point, rings) {
  // Check outer ring
  if (!pointInRing(point, rings[0])) return false
  // Check holes
  for (let i = 1; i < rings.length; i++) {
    if (pointInRing(point, rings[i])) return false
  }
  return true
}

// Ray-casting algorithm
function pointInRing(point, ring) {
  const [x, y] = point
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }
  return inside
}
