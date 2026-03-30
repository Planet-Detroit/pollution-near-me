# Continuation Prompt for Air Pollution Near Me

Copy and paste this into a new Claude Code session to pick up where we left off.

---

## The Prompt

```
I'm Nina from Planet Detroit. We're continuing work on Air Pollution Near Me (air.planetdetroit.org), an interactive map showing Michigan air pollution sources near a user's address.

**Repo:** Planet-Detroit/pollution-near-me (already cloned at /Users/user/projects/pollution-near-me)
**Live:** https://air.planetdetroit.org
**Stack:** React/Vite/Leaflet, Supabase (PostGIS), GitHub Actions nightly sync from EPA ECHO

**What's already built:**
- 3,481 Michigan CAA facilities with compliance data, violations, penalties
- 10,990 regulated pollutant records per facility (from ICIS-Air bulk download)
- Plain-language pollutant health descriptions for 21 pollutants
- 500m major roadway health impact zones with proximity alert
- Address autocomplete (Nominatim), preset radius search, clear button
- Facility detail cards, glossary, about page, legend with tooltips
- Share/embed, GA4 analytics, PD branded header/footer
- Nightly data sync via GitHub Actions

**Key files:**
- Frontend: src/App.jsx, src/components/, src/lib/
- Data sync: sync/echo_sync.py
- Schema: sync/schema.sql
- Specs: docs/remaining-features-spec.md
- EGLE letter draft: docs/egle-letter-draft.md
- Dashboard template: /Users/user/projects/utilities/dashboard-template/

**Supabase tables:** air_facilities, air_facility_pollutants, air_sync_log
**Supabase RPC:** facilities_within_radius(p_lat, p_lon, radius_meters)

**Read docs/remaining-features-spec.md for the full feature roadmap.**

Today I want to work on: [SPECIFY WHICH PHASE/FEATURE]
```

---

## Quick reference for specific features

### To build historical violations (Phase 3b):
Add to the prompt: "Today I want to merge Shelby Jouppi's historical violation data (2018-2023) from Planet-Detroit/air-permit-violation-dashboard into the tool. The CSV is at output/EGLE-AQD-Violation-Notices-2018-Present.csv in that repo."

### To build traffic-weighted roadways (Phase 3a):
Add to the prompt: "Today I want to upgrade the roadway layer with AADT traffic volume data from MDOT so higher-traffic roads show darker/thicker shading."

### To build TRI chemical releases (Phase 4a):
Add to the prompt: "Today I want to add TRI toxic chemical release data showing specific chemicals and quantities each facility releases."

### To scale to Great Lakes states (Phase 6a):
Add to the prompt: "Today I want to expand the tool to cover all Great Lakes states (MI, OH, IN, IL, WI, MN). Will need marker clustering and road buffers for additional states."

### To add the EGLE complaint link (Phase 5b):
Add to the prompt: "Today I want to add a 'Report a Concern' button linking to EGLE's complaint form, ideally pre-filled with facility info."
