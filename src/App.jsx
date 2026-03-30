import { useState, useEffect, useCallback } from 'react'
import AddressSearch from './components/AddressSearch'
import FacilityMap from './components/FacilityMap'
import RadiusSelector from './components/RadiusSelector'
import SummaryPanel from './components/SummaryPanel'
import FacilityList from './components/FacilityList'
import Glossary from './components/Glossary'
import Disclaimer from './components/Disclaimer'
import { queryFacilitiesNearby, getLastSyncDate, aggregateFacilityStats } from './lib/facilities'
import {
  METRO_DETROIT_CENTER,
  MICHIGAN_CENTER,
  METRO_DETROIT_ZOOM,
  MICHIGAN_ZOOM,
  RADIUS_PRESETS,
  DEFAULT_RADIUS_INDEX,
} from './lib/constants'

function App() {
  const params = new URLSearchParams(window.location.search)
  const isEmbed = params.get('embed') === 'true'

  const [userLocation, setUserLocation] = useState(null)
  const [facilities, setFacilities] = useState([])
  const [radiusIndex, setRadiusIndex] = useState(DEFAULT_RADIUS_INDEX)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [lastSyncDate, setLastSyncDate] = useState(null)

  const defaultCenter = isEmbed ? METRO_DETROIT_CENTER : MICHIGAN_CENTER
  const defaultZoom = isEmbed ? METRO_DETROIT_ZOOM : MICHIGAN_ZOOM

  // Fetch last sync date on mount
  useEffect(() => {
    getLastSyncDate().then(setLastSyncDate).catch(console.error)
  }, [])

  // Fetch facilities when location or radius changes
  const fetchFacilities = useCallback(async (location, rIndex) => {
    if (!location) return

    setLoading(true)
    try {
      const radius = RADIUS_PRESETS[rIndex]
      const data = await queryFacilitiesNearby(location.lat, location.lon, radius.meters)
      setFacilities(data)
      setStats(aggregateFacilityStats(data))
    } catch (err) {
      console.error('Failed to fetch facilities:', err)
      setFacilities([])
      setStats(null)
    } finally {
      setLoading(false)
    }
  }, [])

  function handleAddressResult(result) {
    setUserLocation(result)
    fetchFacilities(result, radiusIndex)
  }

  function handleRadiusChange(index) {
    setRadiusIndex(index)
    if (userLocation) {
      fetchFacilities(userLocation, index)
    }
  }

  return (
    <div className={`app ${isEmbed ? 'embed-mode' : ''}`}>
      {!isEmbed && (
        <header className="app-header">
          <h1>Pollution Near Me</h1>
          <p className="app-subtitle">
            See air pollution sources near your Michigan address
          </p>
          <p className="app-credit">
            A tool by{' '}
            <a href="https://planetdetroit.org" target="_blank" rel="noopener noreferrer">
              Planet Detroit
            </a>
          </p>
        </header>
      )}

      <div className="app-content">
        <div className="search-and-controls">
          <AddressSearch onResult={handleAddressResult} isLoading={loading} />
          {userLocation && (
            <RadiusSelector selectedIndex={radiusIndex} onChange={handleRadiusChange} />
          )}
        </div>

        <div className="map-and-summary">
          <FacilityMap
            center={defaultCenter}
            zoom={defaultZoom}
            facilities={facilities}
            userLocation={userLocation}
            radiusMeters={RADIUS_PRESETS[radiusIndex].meters}
          />

          {loading && (
            <div className="loading-overlay">
              <p>Finding facilities near you...</p>
            </div>
          )}

          {stats && !loading && (
            <SummaryPanel
              stats={stats}
              radiusIndex={radiusIndex}
              lastSyncDate={lastSyncDate}
            />
          )}
        </div>

        {facilities.length > 0 && !loading && (
          <FacilityList facilities={facilities} radiusIndex={radiusIndex} />
        )}

        <Glossary />
        <Disclaimer />
      </div>
    </div>
  )
}

export default App
