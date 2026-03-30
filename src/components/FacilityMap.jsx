import { useEffect, useRef } from 'react'
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

// Component to handle map view changes
function MapController({ center, zoom, userLocation, radiusMeters }) {
  const map = useMap()

  useEffect(() => {
    if (userLocation) {
      // Fit map to the radius circle with some padding
      const circle = L.circle([userLocation.lat, userLocation.lon], { radius: radiusMeters })
      const bounds = circle.getBounds()
      map.fitBounds(bounds, { padding: [30, 30] })
    } else {
      map.setView(center, zoom)
    }
  }, [map, center, zoom, userLocation, radiusMeters])

  return null
}

function getMarkerColor(complianceStatus) {
  const info = COMPLIANCE_COLORS[complianceStatus] || COMPLIANCE_COLORS.unknown
  return info.color
}

function getMarkerSize(classification) {
  return CLASSIFICATION_SIZES[classification] || DEFAULT_MARKER_SIZE
}

export default function FacilityMap({
  center,
  zoom,
  facilities,
  userLocation,
  radiusMeters,
}) {
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
              color: '#2f80c3',
              weight: 2,
              fillColor: '#2f80c3',
              fillOpacity: 0.05,
            }}
          />
        </>
      )}

      {/* Facility markers */}
      {facilities.map((f) => (
        <CircleMarker
          key={f.source_id}
          center={[f.lat, f.lon]}
          radius={getMarkerSize(f.classification)}
          pathOptions={{
            color: '#fff',
            weight: 1,
            fillColor: getMarkerColor(f.compliance_status),
            fillOpacity: 0.85,
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
