# Feature Spec: Pollution Near Me

**Date**: 2026-03-30
**Status**: Draft

---

## 1. Purpose

An embeddable interactive map that lets Michigan residents enter their home address and instantly see nearby sources of air pollution — permitted facilities, their compliance status, and whether they've had violations — plus whether they live within the health-impact zone of a major roadway. The goal is to make environmental exposure data accessible to non-experts, presented in plain language with clear visual indicators. This supports Planet Detroit's environmental justice journalism by giving readers a personal connection to pollution data.

## 2. Users

- **Primary user**: Planet Detroit readers — Michigan residents concerned about local air quality, especially those in frontline/fenceline communities in Metro Detroit
- **Secondary user**: Planet Detroit reporters — for sourcing stories, identifying patterns, and providing readers with interactive context alongside articles
- **How they'll access it**: Embedded within WordPress posts/pages on planetdetroit.org via iframe or embedded script. Also accessible as a standalone page for sharing.
- **How often they'll use it**: Spikes around article publication, ongoing organic traffic from search. Readers typically use once (enter their address, explore results), reporters may use repeatedly.

## 3. User Workflow

1. Reader opens a Planet Detroit article containing the embedded tool
2. Reader sees a map of Michigan zoomed to Metro Detroit by default (standalone version shows all of Michigan) with a prominent search bar: "Enter your address to see pollution sources near you"
3. Reader types their address; autocomplete helps them select the correct location
4. The map centers on their address with a marker, and automatically shows:
   - **Colored facility markers** within the default radius (1 mile) indicating pollution sources, color-coded by compliance status
   - **A roadway buffer overlay** highlighting any major roads within 500 meters (~1,640 ft), shaded to indicate the health impact zone
   - **A summary panel** showing: number of facilities nearby, how many have violations, whether they're in a roadway impact zone
5. Reader can tap/click any facility marker to see a popup with:
   - Facility name and address
   - What it is (industry type in plain language)
   - Permit programs (translated to plain English)
   - Compliance status with clear red/yellow/green indicator
   - Violation details if any (count, pollutants, most recent date)
   - Link to facility detail page on EPA ECHO
6. Reader can adjust the search radius using preset buttons: "My block" (0.5 mi) / "My neighborhood" (1 mi) / "My area" (3 mi)
7. Reader can toggle the roadway buffer layer on/off
8. Reader can share their specific view via a URL with embedded coordinates and radius

## 4. Requirements

### Map & Geocoding
1. Interactive map (Leaflet or MapLibre) covering all of Michigan. Default view: Metro Detroit when embedded (`?embed=true`), statewide when standalone
2. Address search bar with autocomplete (Census Bureau geocoder or similar free service)
3. On address entry, geocode to lat/lon and center map on that location
4. Show user's location with a distinct marker and a translucent radius circle

### Facility Data Layer
5. Query EPA ECHO API for Clean Air Act facilities within the selected radius of the user's coordinates
6. Display each facility as a color-coded marker:
   - **Red**: Active, unaddressed High Priority Violation (HPV)
   - **Amber**: HPV addressed by state (EGLE) or EPA — still on federal record
   - **Orange**: Violation within past year
   - **Black**: No violation identified
   - **Gray**: Status unknown
7. Marker size should reflect facility classification (Major > Synthetic Minor > Minor)
8. Clicking a marker opens a popup with facility details (see User Workflow step 5)
9. Translate technical jargon to plain English throughout:
   - "FESOP" -> "Federally Enforceable State Operating Permit"
   - "TVP" -> "Title V (Major Source) Permit"
   - "HPV" -> "High Priority Violation"
   - NAICS/SIC codes -> human-readable industry names
10. Summary panel shows aggregate stats: total facilities, count by compliance status, total penalties

### Roadway Proximity Layer
11. Display major roadways (Interstate + US/State highways) with a 500-meter buffer zone overlay, shaded in a semi-transparent color
12. Road data sourced from Census TIGER/Line (MTFCC codes S1100 primary roads, S1200 secondary roads) or OpenStreetMap, pre-processed and stored
13. If the user's address falls within a roadway buffer zone, display a clear alert in the summary panel explaining the health significance in plain language
14. Roadway layer is toggleable on/off
15. On hover/tap of the roadway buffer, show a tooltip explaining: "Living within 500 meters of a major road is associated with increased risk of asthma, heart disease, and other health effects (EPA, Health Effects Institute)"

### WordPress Embedding
16. Tool must be embeddable in WordPress posts via iframe with responsive sizing
17. Standalone URL must also work (for direct linking and sharing)
18. Responsive design: works on mobile (single-column layout), tablet, and desktop
19. Embed should load quickly — lazy-load facility data only after address entry, not on page load
20. Respect WordPress content width; map should fill the available container width
21. Minimum embed height: 600px mobile, 700px desktop

### Data Accuracy & Attribution
22. Display data freshness date ("Data last updated: [date]") prominently
23. Include methodology note explaining data sources, limitations, and the scientific basis for the 500m roadway buffer
24. Link to EPA ECHO for each facility so users can verify/explore further
25. Include disclaimer: "This tool shows regulatory data from EPA. It does not measure actual air quality at your location. Actual exposure depends on weather, terrain, and other factors."

### Performance
26. Facility data should be pre-cached in Supabase (nightly sync from ECHO API), not queried live per user request — to avoid ECHO API rate limits and ensure fast response
27. Initial map load (before address entry) should complete within 2 seconds
28. Facility results should appear within 1 second of address submission
29. Support at least 100 concurrent users without degradation

## 5. Acceptance Criteria

### Address Search
- [ ] When a user types "48217" (SW Detroit ZIP), then address suggestions appear within 500ms
- [ ] When a user selects an address, then the map centers on that location with a marker and radius circle
- [ ] When a user enters an invalid address (e.g., "asdfghjkl"), then a friendly error message appears: "We couldn't find that address. Try entering a street address or ZIP code in Michigan."
- [ ] When a user enters an address outside Michigan, then a message appears: "This tool covers Michigan. Please enter a Michigan address."
- [ ] When the tool loads with `?embed=true`, then the map is zoomed to Metro Detroit
- [ ] When the tool loads without `?embed=true` (standalone), then the map shows all of Michigan

### Facility Display
- [ ] When the map centers on 48217 with 1-mile radius, then at least 10 facilities appear (known industrial area)
- [ ] When a facility has HPV status, then its marker is red
- [ ] When a facility has "Violation w/in 1 Year" status, then its marker is orange
- [ ] When a facility has "No Violation Identified", then its marker is green
- [ ] When a user clicks a red facility marker, then the popup shows violation count, pollutants, and most recent violation date
- [ ] When the summary panel loads, then it shows correct counts matching the visible markers
- [ ] When a user changes radius from 1 mile to 3 miles, then additional facilities appear and the summary updates

### Roadway Buffer
- [ ] When the map shows the 48217 area, then I-75 and I-94 buffers are visible as shaded overlays
- [ ] When a user's address is within 500m of I-75, then the summary panel shows a roadway proximity alert
- [ ] When a user's address is NOT within 500m of any major road, then no roadway alert appears
- [ ] When a user toggles the roadway layer off, then the buffer overlay disappears but facility markers remain

### WordPress Embed
- [ ] When the tool is embedded via iframe in a WordPress post, then it fills the content width responsively
- [ ] When viewed on a mobile device (375px width), then the layout is single-column with map on top and summary below
- [ ] When the page loads, then only the map and search bar appear (no facility data loaded until address entered)

### Data Accuracy
- [ ] When facility data is compared to a manual ECHO search for the same location and radius, then the same facilities appear (within API pagination limits)
- [ ] When I check a facility's popup data against its ECHO detail page, then name, address, compliance status, and violation count match
- [ ] When data freshness is checked, then the displayed "last updated" date is within 48 hours of the latest sync

### Edge Cases
- [ ] When there are no facilities within the selected radius, then the summary says "No regulated air pollution sources found within [distance]" (not an error)
- [ ] When the ECHO data sync fails, then the tool still works with the most recent cached data and shows a stale-data warning
- [ ] When 50+ facilities are within radius, then the map still performs smoothly (marker clustering if needed)

## 6. Out of Scope

- This tool does NOT measure or estimate actual air quality or pollutant concentrations at the user's address (that would require dispersion modeling like EPA's AERMOD)
- This tool does NOT include water pollution sources (NPDES), hazardous waste (RCRA), or Superfund/brownfield sites (future phases could add these)
- This tool does NOT include state-regulated-only air pollution sources — EGLE regulates many sources under state law that don't appear in federal EPA ECHO data, including fugitive dust sources (asphalt plants, gravel pits, construction sites), small commercial operations (dry cleaners, auto body shops), and Rule 290 permit-by-rule facilities
- This tool does NOT send alerts or notifications when new violations occur (future feature)
- This tool does NOT include historical violation trends or timelines (future feature — would pull from the old dashboard's 2018-2023 data)
- This tool does NOT include demographic/EJ data overlays like MiEJScreen (future feature)
- This tool does NOT independently verify emissions data — TRI and GHG figures are self-reported by facilities to EPA
- Permanently closed facilities are excluded from map and search results
- Cancer risk estimates (future phase — could layer in ProPublica RSEI data)

## 7. Connects To

### Data Sources
- **EPA ECHO REST API** — facility data, compliance status, violations, penalties (`echodata.epa.gov/echo/air_rest_services.*`)
- **Census Bureau Geocoder** — address-to-coordinates (`geocoding.geo.census.gov/geocoder/`) — free, no API key
- **Census TIGER/Line** — major road geometries for buffer calculation (pre-processed, stored as GeoJSON)

### Planet Detroit Infrastructure
- **Supabase** — cached facility data store + roadway geometry (same Supabase instance as other PD projects)
- **Vercel** — hosting for the standalone app
- **WordPress (planetdetroit.org)** — embed target via iframe
- **GitHub Actions** — nightly data sync from ECHO API to Supabase

### Related Projects
- `Planet-Detroit/air-permit-violation-dashboard` — predecessor project (2018-2023 violation data, now stale)
- `srjouppi/michigan-egle-database-auto-scraper` — companion scraper (historical reference)
- `Planet-Detroit/air-permit-violation-dashboard` — predecessor project by Shelby Jouppi (2018-2023 violation data). Shelby should be credited in the new repo as the originator of this work.
- `srjouppi/michigan-egle-database-auto-scraper` — Shelby's companion scraper (historical reference)
- `civic-action-builder` — similar embed-in-WordPress pattern
- `michigan-environmental-orgs` — similar React/Leaflet/Supabase stack

## 8. Known Risks

- **If data is wrong**: Showing incorrect compliance status could mislead residents about their exposure or unfairly characterize a facility. Mitigation: always link to authoritative EPA source, display clear "last updated" date, include disclaimer.
- **If data is stale**: ECHO data can lag EGLE's own records (EPA has noted Michigan-specific data discrepancies). Mitigation: display sync date, note that EPA data may lag state records, link to EGLE for most current info. HPV status is particularly prone to staleness — the tool now distinguishes active vs. addressed-by-state HPVs using EPA's `AIRHpvStatus` field.
- **If tool goes down**: Readers clicking through from an article would see a broken embed. Mitigation: graceful fallback (static message with link to EPA ECHO search), Vercel has good uptime.
- **If geocoder is unavailable**: Census geocoder occasionally has downtime. Mitigation: fallback to ZIP-code centroid lookup from a local table.
- **Reputational risk**: As a journalism org, Planet Detroit's credibility depends on accuracy. The tool must be transparent about what it shows and doesn't show. Never imply causation between facility proximity and health outcomes — present the data and cite the science, let readers draw conclusions.
- **Roadway data size**: TIGER/Line road data for all of Michigan could be large. Mitigation: pre-process to only include S1100/S1200 roads, simplify geometries, serve as vector tiles or pre-computed buffers.
- **ECHO API rate limits / reliability**: ECHO API can be slow or throttled. Mitigation: nightly Supabase cache means the public-facing tool never hits ECHO directly.

## 9. Success Metrics

- **Engagement**: Number of unique addresses searched per month
- **Embed reach**: Number of articles/pages embedding the tool
- **Completion rate**: % of users who enter an address and then interact with at least one facility popup
- **Sharing**: Number of times the shareable URL is used
- **Editorial value**: Number of stories sourced from patterns discovered in the tool

---

## Technical Approach (Recommended)

### Stack
- **Frontend**: React + Vite + Leaflet (consistent with existing PD projects)
- **Styling**: Tailwind CSS
- **Data store**: Supabase (PostGIS for spatial queries)
- **Hosting**: Vercel (standalone) + iframe embed for WordPress
- **Data pipeline**: Python script on GitHub Actions (nightly ECHO sync)

### Architecture
```
[GitHub Actions - nightly]
  ECHO API -> Python sync script -> Supabase (PostGIS)

[User Request Flow]
  User enters address
    -> Census Geocoder API (lat/lon)
    -> Supabase PostGIS query: ST_DWithin(facility, user_point, radius)
    -> Return facilities + roadway proximity boolean
    -> Render on Leaflet map
```

### Why Supabase + PostGIS (not live ECHO queries)
1. ECHO API requires a two-step flow (get_facilities -> get_download) that's too slow for interactive use
2. ECHO has no SLA or rate limit guarantees
3. PostGIS spatial queries (`ST_DWithin`) are fast and purpose-built for "find points within X meters"
4. Pre-cached data means the map loads in <1 second after geocoding
5. We can enrich the data (add plain-English labels, merge with historical dashboard data later)

### Data Sync Script (GitHub Actions, nightly)
1. Call ECHO API: `air_rest_services.get_facilities?p_st=MI&p_p=Y`
2. Download all columns via `get_download`
3. Upsert to Supabase `air_facilities` table with columns matching ECHO fields
4. Log sync report (new facilities, changed statuses, errors)

### Roadway Buffer
- Pre-process Census TIGER/Line S1100 + S1200 roads for Michigan
- Compute 500m buffer geometries using PostGIS or QGIS
- Store as a single GeoJSON layer in Supabase or as static tiles
- Serve to frontend; use Turf.js `booleanPointInPolygon` to check if user is in a buffer zone

### Embed Strategy
Same pattern as civic-action-builder:
- Build as standalone Vite app deployed to Vercel
- GitHub repo: `Planet-Detroit/pollution-near-me`
- Embed in WordPress via: `<iframe src="https://pollution-near-me.vercel.app/?embed=true" width="100%" height="700" frameborder="0"></iframe>`
- `?embed=true` zooms to Metro Detroit and hides standalone header/footer
- Use `postMessage` API to communicate iframe height to parent for responsive sizing

---

## Phases

### Phase 1 (MVP) — COMPLETE
- Address search + geocoding (OpenStreetMap Nominatim)
- Facility markers from cached ECHO data (color-coded by compliance status)
- Facility popups with plain-English details
- Preset radius buttons (0.5 / 1 / 3 miles)
- Summary panel with counts
- WordPress-embeddable via iframe
- Nightly ECHO data sync via GitHub Actions
- Mobile-responsive

### Phase 2 — COMPLETE
- Major roadway buffer overlay with health alert (500m, EPA/HEI research)
- Shareable URLs with embedded coordinates
- Regulated pollutants with health effect descriptions
- Click-to-detail: clicking map markers shows full facility info below map
- Active vs. addressed HPV distinction (red vs. amber markers)
- Permanently closed facilities filtered out
- Comprehensive data caveats (self-reported emissions, state-only sources, approximate coordinates)
- About page, Glossary, and Map Legend with tooltips

### Phase 3 (Next)
- Historical violation trends from old dashboard data (2018-2023)
- Demographic/EJ overlay from MiEJScreen
- Cancer risk estimates from ProPublica RSEI data
- Alert/notification system for new violations
- EGLE state-level data integration (would fill gap of state-only regulated sources)
- Marker clustering for dense areas at low zoom levels

---

_After completing this spec, hand it to Claude Code and say: "Read this spec. Write automated tests for each acceptance criterion first, then implement the feature."_
