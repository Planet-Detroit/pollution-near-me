# Air Pollution Near Me — Remaining Features Spec

**Date:** 2026-03-30
**Status:** Planned
**Project:** https://github.com/Planet-Detroit/pollution-near-me
**Live:** https://air.planetdetroit.org

---

## What's Built (Phases 1-2 — Complete)

- Interactive map of 3,481 Michigan CAA facilities with compliance data
- Address autocomplete (Nominatim) with preset radius search (0.5/1/3 mi)
- All facilities shown on load; grey-out effect on search
- Color-coded markers (red=HPV, orange=recent violation, black=no violations)
- Size-coded markers (Major > Synthetic Minor > Minor)
- Facility detail cards with violations, enforcement, inspections, penalties
- Regulated pollutants for each facility (10,990 records from ICIS-Air)
- Plain-language pollutant health descriptions for 21 pollutants
- 500m major roadway health impact zones (all MI interstates + highways)
- Road proximity alert when user is within a buffer zone
- Glossary, About page, legend with tooltips
- Share button (copy link, X, Facebook, Bluesky, embed code)
- URL state (shareable/bookmarkable links)
- PD branded header/footer
- Nightly data sync (ECHO API + ICIS-Air bulk) via GitHub Actions
- GA4 analytics (G-5QQJ9SVV07)
- WordPress embeddable via iframe at air.planetdetroit.org/?embed=true

---

## Phase 3: Enhanced Roadway Data + Historical Violations

### 3a. Traffic Volume-Weighted Roadway Buffers

**What:** Replace uniform 500m buffers with traffic-volume-weighted visualization. Higher-traffic roads get more prominent shading.

**Data sources:**
- MDOT Traffic Monitoring Information System (TMIS): AADT counts for all Michigan roads — https://mdotjboss.state.mi.us/tmispublic/
- SEMCOG traffic counts for Metro Detroit — https://semcog.org/traffic-counts

**Implementation:**
1. Download MDOT AADT data (available as shapefile or CSV)
2. Join AADT counts to TIGER road segments by LINEARID or spatial join
3. Classify roads into tiers: Very High (100K+), High (50-100K), Moderate (25-50K), Lower (10-25K)
4. Render with gradient shading — darker purple = more traffic
5. Add AADT tooltip on hover: "I-94 at this location: ~120,000 vehicles/day"
6. Update About page to explain the graduated shading

**Effort:** Medium (1 session). Data processing + UI update.

### 3b. Historical Violation Data (2018-2023)

**What:** Merge Shelby Jouppi's parsed violation notice data from the old dashboard. This gives historical depth that ECHO doesn't have — specifically the parsed violation table text from PDFs.

**Data source:** `Planet-Detroit/air-permit-violation-dashboard/output/EGLE-AQD-Violation-Notices-2018-Present.csv`

**Fields available:**
- SRN, facility name, date, violation comments, full PDF text
- Process description, rule/permit condition violated (in archive/violations-parsed-raw.csv)
- Document URL (PDF links — may be dead since EGLE stopped publishing)

**Implementation:**
1. Download the CSV from the old repo
2. Create `air_historical_violations` table in Supabase
3. Join to facilities by SRN (extract from source_id)
4. Add "Violation History" section to facility cards showing historical notices
5. Add timeline visualization (violations by year: 2018-2023)
6. Note in UI that historical data stops at Aug 2023 when EGLE stopped publishing

**Effort:** Medium (1 session). Data import + UI.

---

## Phase 4: TRI Emissions + Cancer Risk Data

### 4a. TRI Chemical-Level Emissions

**What:** Show specific toxic chemicals each facility releases and in what quantities, from the Toxics Release Inventory.

**Data source:** EPA TRI Explorer or bulk download — https://www.epa.gov/toxics-release-inventory-tri-program/tri-basic-data-files-calendar-years-1987-present

**Fields available:**
- Facility name, chemical name, total air releases (lbs/year)
- On-site air releases (fugitive + stack)
- CAS number, carcinogen flag

**Implementation:**
1. Download TRI basic data file for most recent year, filter to Michigan
2. Create `air_tri_releases` table
3. Join to facilities by Registry ID or spatial join
4. Add "Toxic Chemical Releases" section to facility cards
5. Show chemical name, pounds released, whether it's a carcinogen
6. Add to nightly/weekly sync

**Effort:** Medium (1 session).

### 4b. ProPublica Cancer Risk Estimates

**What:** Layer in estimated cancer risk from industrial air pollution at the census tract level, from ProPublica's "Sacrifice Zones" analysis.

**Data source:** ProPublica released their RSEI-derived data — https://www.propublica.org/article/were-releasing-the-data-behind-our-toxic-air-analysis

**Implementation:**
1. Download ProPublica's cancer risk data
2. Overlay as choropleth layer on the map (census tract level)
3. Show estimated additional cancer risk in the summary panel
4. Toggle on/off like the roadway layer
5. Important disclaimer: these are modeled estimates, not measurements

**Effort:** Medium-High. Choropleth rendering + data processing.

---

## Phase 5: Engagement Features

### 5a. Saved Addresses + Violation Alerts

**What:** Users save their address and get notified when new violations appear nearby.

**Implementation:**
- Email collection form (no full user accounts)
- Store address + email in Supabase
- Nightly sync script compares new violations to saved addresses
- Send email digest via SendGrid/Resend when new violations found
- Unsubscribe link in every email

**Effort:** High (dedicated session). New backend infrastructure.

### 5b. Report a Concern

**What:** Button linking to EGLE's pollution complaint form, pre-filled with the facility's info.

**Implementation:** Mostly a well-placed link: https://www.michigan.gov/egle/about/contact/pollution-complaints

**Effort:** Low (30 min).

---

## Phase 6: Geographic Scaling

### 6a. Great Lakes States (MI, OH, IN, IL, WI, MN)

**What:** Expand to cover ~25-30K facilities across 6 states.

**Changes needed:**
- Remove state filter from ECHO query
- Add state selector or auto-detect from geocoded address
- Marker clustering (react-leaflet-cluster) for performance
- Process TIGER road buffers for additional states
- Larger Supabase instance (still free tier probably sufficient)

**Effort:** Medium (1-2 sessions).

### 6b. Nationwide

**What:** All 279,000 CAA facilities across 50 states.

**Changes needed:**
- Marker clustering (required at this scale)
- Vector tiles for road buffers (PMTiles or Mapbox) instead of GeoJSON
- Supabase paid plan (~$25/month)
- Server-side spatial queries only (no loading all facilities client-side)
- Consider Next.js or similar for SSR/OG image generation

**Effort:** High (multiple sessions). Architectural changes.

---

## Other Enhancements

- **Facility comparison:** Select 2-3 facilities and compare side by side
- **Export to PDF:** Generate a report for a searched address
- **Demographic overlay:** MiEJScreen data showing environmental justice indicators
- **Push to CMS:** Auto-generate WordPress draft with embedded tool for a specific address
- **Print-friendly view:** Optimized layout for printing facility details

---

## Priority Order (Recommended)

1. **Phase 5b** — Report a Concern link (30 min, high reader value)
2. **Phase 3b** — Historical violations (1 session, unique data nobody else has)
3. **Phase 3a** — Traffic-weighted roadways (1 session, better science)
4. **Phase 4a** — TRI chemical releases (1 session, answers "what chemicals?")
5. **Phase 6a** — Great Lakes expansion (1-2 sessions, 8x more readers)
6. **Phase 4b** — Cancer risk overlay (complex but powerful)
7. **Phase 5a** — Alerts (most complex, biggest long-term engagement)
