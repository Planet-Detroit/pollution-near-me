import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

/**
 * Loads and renders the 500m major roadway buffer GeoJSON on the map.
 * Only loads the data once, then toggles visibility.
 */
export default function RoadwayLayer({ visible }) {
  const map = useMap()
  const layerRef = useRef(null)
  const loadedRef = useRef(false)

  useEffect(() => {
    if (!visible) {
      if (layerRef.current) {
        map.removeLayer(layerRef.current)
      }
      return
    }

    if (layerRef.current) {
      map.addLayer(layerRef.current)
      return
    }

    // Load GeoJSON only once
    if (!loadedRef.current) {
      loadedRef.current = true
      fetch('/mi-road-buffers-500m.geojson')
        .then(r => r.json())
        .then(data => {
          layerRef.current = L.geoJSON(data, {
            style: {
              color: '#7c3aed',
              weight: 0.5,
              fillColor: '#7c3aed',
              fillOpacity: 0.12,
              interactive: false,
            },
          })
          if (visible) {
            layerRef.current.addTo(map)
          }
        })
        .catch(err => console.warn('Failed to load roadway buffers:', err))
    }

    return () => {
      if (layerRef.current && map.hasLayer(layerRef.current)) {
        map.removeLayer(layerRef.current)
      }
    }
  }, [map, visible])

  return null
}
