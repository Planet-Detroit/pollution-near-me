import { useState, useEffect, useCallback } from 'react'
import AddressSearch from './components/AddressSearch'
import FacilityMap from './components/FacilityMap'
import RadiusSelector from './components/RadiusSelector'
import SummaryPanel from './components/SummaryPanel'
import FacilityList from './components/FacilityList'
import Glossary from './components/Glossary'
import Disclaimer from './components/Disclaimer'
import PDHeader from './components/PDHeader'
import PDFooter from './components/PDFooter'
import { queryFacilitiesNearby, getLastSyncDate, aggregateFacilityStats } from './lib/facilities'
import {
  METRO_DETROIT_CENTER,
  MICHIGAN_CENTER,
  METRO_DETROIT_ZOOM,
  MICHIGAN_ZOOM,
  RADIUS_PRESETS,
  DEFAULT_RADIUS_INDEX,
} from './lib/constants'

const TABS = [
  { id: 'map', label: 'Map' },
  { id: 'glossary', label: 'Glossary' },
]

function App() {
  const params = new URLSearchParams(window.location.search)
  const isEmbed = params.get('embed') === 'true'

  const [activeTab, setActiveTab] = useState('map')
  const [userLocation, setUserLocation] = useState(null)
  const [facilities, setFacilities] = useState([])
  const [radiusIndex, setRadiusIndex] = useState(DEFAULT_RADIUS_INDEX)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [lastSyncDate, setLastSyncDate] = useState(null)

  const defaultCenter = isEmbed ? METRO_DETROIT_CENTER : MICHIGAN_CENTER
  const defaultZoom = isEmbed ? METRO_DETROIT_ZOOM : MICHIGAN_ZOOM

  useEffect(() => {
    getLastSyncDate().then(setLastSyncDate).catch(console.error)
  }, [])

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
    setActiveTab('map')
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
        <PDHeader
          title="Pollution Near Me"
          subtitle="See air pollution sources near your Michigan address"
        />
      )}

      <div className="pd-container">
        <div className="app-content">
          <div className="search-and-controls">
            <AddressSearch onResult={handleAddressResult} isLoading={loading} />
          </div>

          {/* Tab navigation */}
          <nav className="tab-nav" role="tablist">
            {TABS.map(tab => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Map tab */}
          {activeTab === 'map' && (
            <>
              {userLocation && (
                <RadiusSelector selectedIndex={radiusIndex} onChange={handleRadiusChange} />
              )}

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
            </>
          )}

          {/* Glossary tab */}
          {activeTab === 'glossary' && (
            <Glossary />
          )}

          <Disclaimer />
        </div>
      </div>

      {!isEmbed && (
        <PDFooter
          toolName="Pollution Near Me"
          toolCredits="Inspired by Shelby Jouppi's air permit violation dashboard"
        />
      )}
    </div>
  )
}

export default App
