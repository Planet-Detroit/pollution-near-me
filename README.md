# Pollution Near Me

**See air pollution sources near your Michigan address.**

An interactive map that lets residents enter their home address and instantly see nearby sources of air pollution — permitted facilities, their compliance status, and whether they've had violations.

Built by [Planet Detroit](https://planetdetroit.org), a nonprofit environmental journalism organization in Metro Detroit.

This project builds on the pioneering work of **[Shelby Jouppi](https://www.shelbyjouppi.com)**, whose [air permit violation dashboard](https://github.com/Planet-Detroit/air-permit-violation-dashboard) first made EGLE's air quality data accessible to the public.

## How It Works

1. **Enter your address** — type any Michigan address or ZIP code
2. **See what's nearby** — facilities appear as colored markers on the map:
   - **Red** = High Priority Violation
   - **Orange** = Violation within the past year
   - **Green** = Compliant (no violations)
3. **Click any facility** for details — compliance status, violation history, pollutants, permits, and links to the full EPA report
4. **Adjust the radius** — "My block" (0.5 mi), "My neighborhood" (1 mi), or "My area" (3 mi)

## Data Sources

- **Facility data**: [EPA ECHO](https://echo.epa.gov/) (Enforcement and Compliance History Online) — 3,481 Michigan Clean Air Act facilities, synced nightly
- **Address lookup**: [U.S. Census Bureau Geocoder](https://geocoding.geo.census.gov/geocoder/)
- **Permit documents**: [EGLE Air Permits System](https://www.egle.state.mi.us/aps/downloads/SRN/)

## Embed in WordPress

```html
<iframe
  src="https://air.planetdetroit.org/?embed=true"
  width="100%"
  height="900"
  frameborder="0"
  title="Pollution Near Me - Find air pollution sources near your address"
></iframe>
```

The `?embed=true` parameter zooms the map to Metro Detroit and hides the standalone header.

## Tech Stack

- **Frontend**: React, Vite, Leaflet
- **Database**: Supabase (PostGIS for spatial queries)
- **Data sync**: Python script + GitHub Actions (nightly)
- **Hosting**: Vercel

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

### Environment Variables

Create a `.env` file:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Data Sync

The sync script pulls data from EPA ECHO and upserts to Supabase:

```bash
cd sync
pip install -r requirements.txt

SUPABASE_URL=your_url SUPABASE_SERVICE_KEY=your_service_key python echo_sync.py
```

## Disclaimer

This tool shows regulatory data from the EPA ECHO database. It does not measure actual air quality at your location. Actual exposure depends on weather, terrain, stack height, and other factors. Always verify details using the linked EPA facility reports.

## License

MIT

## Credits

- **Planet Detroit** — [planetdetroit.org](https://planetdetroit.org)
- **Shelby Jouppi** — Original [air permit violation dashboard](https://github.com/Planet-Detroit/air-permit-violation-dashboard) and [EGLE database scraper](https://github.com/srjouppi/michigan-egle-database-auto-scraper)
- **EPA ECHO** — Facility and compliance data
