import { useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Circle, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { COMPLIANCE_COLORS, CLASSIFICATION_SIZES, DEFAULT_MARKER_SIZE } from '../lib/constants'
import FacilityPopup from './FacilityPopup'

// Fix Leaflet default marker icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function MapController({ center, zoom, userLocation, radiusMeters }) {
  const map = useMap()

  useEffect(() => {
    if (userLocation) {
      const fitToRadius = () => {
        try {
          const circle = L.circle([userLocation.lat, userLocation.lon], { radius: radiusMeters })
          circle.addTo(map)
          map.fitBounds(circle.getBounds(), { padding: [30, 30] })
          circle.remove()
        } catch (err) {
          map.setView([userLocation.lat, userLocation.lon], 13)
        }
      }

      if (map.getSize().x > 0) {
        fitToRadius()
      } else {
        map.whenReady(fitToRadius)
      }
    } else {
      map.setView(center, zoom)
    }
  }, [map, center, zoom, userLocation, radiusMeters])

  return null
}

function getMarkerColor(complianceStatus) {
  return (COMPLIANCE_COLORS[complianceStatus] || COMPLIANCE_COLORS.unknown).color
}

function getMarkerSize(classification) {
  return CLASSIFICATION_SIZES[classification] || DEFAULT_MARKER_SIZE
}

/**
 * Check if a facility is within the search radius using simple distance calc.
 */
function isWithinRadius(facility, userLocation, radiusMeters) {
  if (!userLocation) return false
  const R = 6371000 // Earth radius in meters
  const dLat = (facility.lat - userLocation.lat) * Math.PI / 180
  const dLon = (facility.lon - userLocation.lon) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(userLocation.lat * Math.PI / 180) *
    Math.cos(facility.lat * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c <= radiusMeters
}

export default function FacilityMap({
  center,
  zoom,
  allFacilities,
  nearbyFacilities,
  userLocation,
  radiusMeters,
}) {
  // Build a set of nearby source_ids for fast lookup
  const nearbyIds = new Set((nearbyFacilities || []).map(f => f.source_id))
  const hasSearched = !!userLocation

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="facility-map"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapController
        center={center}
        zoom={zoom}
        userLocation={userLocation}
        radiusMeters={radiusMeters}
      />

      {/* User location marker and radius circle */}
      {userLocation && (
        <>
          <Marker position={[userLocation.lat, userLocation.lon]}>
            <Popup>
              <strong>Your location</strong>
              <br />
              {userLocation.matchedAddress}
            </Popup>
          </Marker>
          <Circle
            center={[userLocation.lat, userLocation.lon]}
            radius={radiusMeters}
            pathOptions={{
              color: '#2982C4',
              weight: 2,
              fillColor: '#2982C4',
              fillOpacity: 0.05,
            }}
          />
        </>
      )}

      {/* All facility markers */}
      {(allFacilities || []).map((f) => {
        const isNearby = nearbyIds.has(f.source_id)
        const dimmed = hasSearched && !isNearby

        return (
          <CircleMarker
            key={f.source_id}
            center={[f.lat, f.lon]}
            radius={dimmed ? getMarkerSize(f.classification) * 0.6 : getMarkerSize(f.classification)}
            pathOptions={{
              color: dimmed ? '#ccc' : '#fff',
              weight: dimmed ? 0.5 : 1,
              fillColor: dimmed ? '#d4d4d4' : getMarkerColor(f.compliance_status),
              fillOpacity: dimmed ? 0.3 : 0.85,
            }}
          >
            <Popup maxWidth={320} minWidth={250}>
              <FacilityPopup facility={f} />
            </Popup>
          </CircleMarker>
        )
      })}

      {/* Render nearby facilities on top (higher z-index via rendering order) */}
      {hasSearched && (nearbyFacilities || []).map((f) => (
        <CircleMarker
          key={`nearby-${f.source_id}`}
          center={[f.lat, f.lon]}
          radius={getMarkerSize(f.classification)}
          pathOptions={{
            color: '#fff',
            weight: 1.5,
            fillColor: getMarkerColor(f.compliance_status),
            fillOpacity: 0.9,
          }}
        >
          <Popup maxWidth={320} minWidth={250}>
            <FacilityPopup facility={f} />
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}
