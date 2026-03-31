import { useState, useEffect, useCallback } from 'react'
import AddressSearch from './components/AddressSearch'
import FacilityMap from './components/FacilityMap'
import RadiusSelector from './components/RadiusSelector'
import SummaryPanel from './components/SummaryPanel'
import FacilityList from './components/FacilityList'
import Glossary from './components/Glossary'
import About from './components/About'
import Disclaimer from './components/Disclaimer'
import MapLegend from './components/MapLegend'
import ShareButton from './components/ShareButton'
import PDHeader from './components/PDHeader'
import PDFooter from './components/PDFooter'
import { queryAllFacilities, queryFacilitiesNearby, queryFacilityBySourceId, queryPollutantsForFacilities, getLastSyncDate, aggregateFacilityStats } from './lib/facilities'
import { isNearMajorRoad } from './lib/roadways'
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
  { id: 'about', label: 'About' },
  { id: 'glossary', label: 'Glossary' },
]

function App() {
  const urlParams = new URLSearchParams(window.location.search)
  const isEmbed = urlParams.get('embed') === 'true'

  // Restore state from URL if present
  const urlLat = parseFloat(urlParams.get('lat'))
  const urlLon = parseFloat(urlParams.get('lon'))
  const urlAddr = urlParams.get('addr')
  const urlRadius = parseInt(urlParams.get('r'))
  const initialRadius = (!isNaN(urlRadius) && urlRadius >= 0 && urlRadius < RADIUS_PRESETS.length)
    ? urlRadius : DEFAULT_RADIUS_INDEX
  const initialLocation = (!isNaN(urlLat) && !isNaN(urlLon))
    ? { lat: urlLat, lon: urlLon, matchedAddress: urlAddr || `${urlLat}, ${urlLon}` }
    : null

  const [activeTab, setActiveTab] = useState('map')
  const [userLocation, setUserLocation] = useState(initialLocation)
  const [allFacilities, setAllFacilities] = useState([])
  const [nearbyFacilities, setNearbyFacilities] = useState([])
  const [radiusIndex, setRadiusIndex] = useState(initialRadius)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [lastSyncDate, setLastSyncDate] = useState(null)
  const [showRoadways, setShowRoadways] = useState(true)
  const [nearMajorRoad, setNearMajorRoad] = useState(null)
  const [pollutantMap, setPollutantMap] = useState({}) // source_id -> [{ pollutant_desc }]
  const [selectedFacility, setSelectedFacility] = useState(null) // full detail for a clicked facility

  const defaultCenter = isEmbed ? METRO_DETROIT_CENTER : MICHIGAN_CENTER
  const defaultZoom = isEmbed ? METRO_DETROIT_ZOOM : MICHIGAN_ZOOM

  // Load all facilities and sync date on mount
  useEffect(() => {
    getLastSyncDate().then(setLastSyncDate).catch(console.error)
    queryAllFacilities().then(setAllFacilities).catch(console.error)
  }, [])

  // If we restored location from URL, fetch nearby and check road proximity
  useEffect(() => {
    if (initialLocation && allFacilities.length > 0 && nearbyFacilities.length === 0 && !loading) {
      fetchNearby(initialLocation, initialRadius)
      isNearMajorRoad(initialLocation.lat, initialLocation.lon).then(setNearMajorRoad)
    }
  }, [allFacilities]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchNearby = useCallback(async (location, rIndex) => {
    if (!location) return

    setLoading(true)
    try {
      const radius = RADIUS_PRESETS[rIndex]
      const data = await queryFacilitiesNearby(location.lat, location.lon, radius.meters)
      setNearbyFacilities(data)
      setStats(aggregateFacilityStats(data))
      // Fetch regulated pollutants for nearby facilities
      const ids = data.map(f => f.source_id)
      queryPollutantsForFacilities(ids).then(setPollutantMap)
    } catch (err) {
      console.error('Failed to fetch facilities:', err)
      setNearbyFacilities([])
      setStats(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Update URL when location/radius changes (without page reload)
  function updateUrl(location, rIndex) {
    if (!location) return
    const params = new URLSearchParams(window.location.search)
    params.set('lat', location.lat.toFixed(5))
    params.set('lon', location.lon.toFixed(5))
    params.set('r', rIndex.toString())
    if (location.matchedAddress) {
      params.set('addr', location.matchedAddress)
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`
    window.history.replaceState({}, '', newUrl)
  }

  // When a facility dot is clicked, fetch full detail and show it below the map
  async function handleFacilityClick(facility) {
    // If this facility is already in the nearby results, use that data (it's full detail)
    const nearbyMatch = nearbyFacilities.find(f => f.source_id === facility.source_id)
    if (nearbyMatch) {
      setSelectedFacility(nearbyMatch)
    } else {
      // allFacilities only has minimal columns, so fetch full detail
      const fullDetail = await queryFacilityBySourceId(facility.source_id)
      if (fullDetail) setSelectedFacility(fullDetail)
    }
    // Fetch pollutants if we don't already have them
    if (!pollutantMap[facility.source_id]) {
      const pollutants = await queryPollutantsForFacilities([facility.source_id])
      setPollutantMap(prev => ({ ...prev, ...pollutants }))
    }
  }

  function handleClear() {
    setUserLocation(null)
    setNearbyFacilities([])
    setStats(null)
    setNearMajorRoad(null)
    setPollutantMap({})
    setSelectedFacility(null)
    // Reset URL
    const params = new URLSearchParams(window.location.search)
    params.delete('lat')
    params.delete('lon')
    params.delete('r')
    params.delete('addr')
    const clean = params.toString() ? `?${params}` : window.location.pathname
    window.history.replaceState({}, '', clean)
  }

  function handleAddressResult(result) {
    setUserLocation(result)
    setActiveTab('map')
    fetchNearby(result, radiusIndex)
    updateUrl(result, radiusIndex)
    // Check road proximity
    isNearMajorRoad(result.lat, result.lon).then(setNearMajorRoad)
  }

  function handleRadiusChange(index) {
    setRadiusIndex(index)
    if (userLocation) {
      fetchNearby(userLocation, index)
      updateUrl(userLocation, index)
    }
  }

  // Build share URL — works for both address searches and selected facilities
  function getShareUrl() {
    if (userLocation) {
      const params = new URLSearchParams()
      params.set('lat', userLocation.lat.toFixed(5))
      params.set('lon', userLocation.lon.toFixed(5))
      params.set('r', radiusIndex.toString())
      if (userLocation.matchedAddress) {
        params.set('addr', userLocation.matchedAddress)
      }
      return `${window.location.origin}${window.location.pathname}?${params.toString()}`
    }
    if (selectedFacility) {
      const params = new URLSearchParams()
      params.set('lat', selectedFacility.lat.toFixed(5))
      params.set('lon', selectedFacility.lon.toFixed(5))
      params.set('r', '0')
      params.set('addr', selectedFacility.facility_name)
      return `${window.location.origin}${window.location.pathname}?${params.toString()}`
    }
    return window.location.href
  }

  return (
    <div className={`app ${isEmbed ? 'embed-mode' : ''}`}>
      {!isEmbed && (
        <PDHeader
          title="Air Pollution Near Me"
          subtitle="See air pollution sources near your Michigan address"
        />
      )}

      <div className="pd-container">
        <div className="app-content">
          <div className="search-and-controls">
            <AddressSearch onResult={handleAddressResult} isLoading={loading} />
            {(userLocation || selectedFacility) && (
              <button className="clear-button" onClick={handleClear}>
                Clear search
              </button>
            )}
          </div>

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

          {activeTab === 'map' && (
            <>
              {userLocation && (
                <div className="controls-row">
                  <RadiusSelector selectedIndex={radiusIndex} onChange={handleRadiusChange} />
                  <ShareButton
                    url={getShareUrl()}
                    address={userLocation.matchedAddress}
                    lat={userLocation.lat}
                    lon={userLocation.lon}
                    stats={stats}
                  />
                </div>
              )}

              <div className="map-and-summary">
                <FacilityMap
                  center={defaultCenter}
                  zoom={defaultZoom}
                  allFacilities={allFacilities}
                  nearbyFacilities={nearbyFacilities}
                  userLocation={userLocation}
                  radiusMeters={RADIUS_PRESETS[radiusIndex].meters}
                  showRoadways={showRoadways}
                  onFacilityClick={handleFacilityClick}
                />

                {loading && (
                  <div className="loading-overlay">
                    <p>Finding facilities near you...</p>
                  </div>
                )}

                <div className="map-controls-bar">
                  <MapLegend />
                  <label className="roadway-toggle">
                    <input
                      type="checkbox"
                      checked={showRoadways}
                      onChange={(e) => setShowRoadways(e.target.checked)}
                    />
                    Show major roadway health impact zones (500m)
                  </label>
                </div>

                {nearMajorRoad === true && userLocation && (
                  <div className="road-alert">
                    <strong>You are within 500 meters of a major roadway.</strong>{' '}
                    Research links living this close to highways and high-traffic roads to increased
                    risk of asthma, heart disease, and other health effects due to traffic-related
                    air pollution (EPA, Health Effects Institute).
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

              {/* Show selected facility detail when a dot is clicked */}
              {selectedFacility && !loading && (
                <>
                  {!userLocation && (
                    <div className="controls-row">
                      <ShareButton
                        url={getShareUrl()}
                        address={selectedFacility.facility_name}
                        lat={selectedFacility.lat}
                        lon={selectedFacility.lon}
                      />
                    </div>
                  )}
                  <FacilityList
                    facilities={[selectedFacility]}
                    radiusIndex={radiusIndex}
                    pollutantMap={pollutantMap}
                    title="Selected Facility"
                    onDismiss={() => setSelectedFacility(null)}
                  />
                </>
              )}

              {nearbyFacilities.length > 0 && !loading && (
                <FacilityList facilities={nearbyFacilities} radiusIndex={radiusIndex} pollutantMap={pollutantMap} />
              )}
            </>
          )}

          {activeTab === 'about' && <About />}

          {activeTab === 'glossary' && <Glossary />}

          <Disclaimer />
        </div>
      </div>

      {!isEmbed && (
        <PDFooter
          toolName="Air Pollution Near Me"
          toolCredits="Inspired by Shelby Jouppi's air permit violation dashboard"
        />
      )}
    </div>
  )
}

export default App
