# Pollution Near Me

**See air pollution sources near your Michigan address.**

Live: [air.planetdetroit.org](https://air.planetdetroit.org/)

An interactive map that lets residents enter their home address and instantly see nearby sources of air pollution regulated under the federal Clean Air Act — permitted facilities, their compliance status, violation history, and the pollutants they're permitted to emit.

Built by [Planet Detroit](https://planetdetroit.org), a nonprofit environmental journalism organization in Metro Detroit. This project builds on the pioneering work of **[Shelby Jouppi](https://www.shelbyjouppi.com)**, whose [air permit violation dashboard](https://github.com/Planet-Detroit/air-permit-violation-dashboard) first made EGLE's air quality data accessible to the public.

## How It Works

1. **Enter your address** — type any Michigan address or ZIP code
2. **See what's nearby** — facilities appear as colored markers on the map:
   - **Red** = Active, unaddressed High Priority Violation (most serious)
   - **Amber** = High Priority Violation addressed by state (EGLE marked as addressed, still on EPA record)
   - **Orange** = Violation within the past year
   - **Black** = No violations identified
3. **Click any facility** for details — compliance status, violation history, pollutants with health effects, regulated emissions, enforcement actions, permits, and links to the full EPA report
4. **Adjust the radius** — "My block" (0.5 mi), "My neighborhood" (1 mi), or "My area" (3 mi)
5. **Check roadway proximity** — toggleable 500-meter major roadway health impact zones based on EPA/HEI research
6. **Share your results** — copy link, share to social media, or copy embed code

## Data Sources

- **Facility & compliance data**: [EPA ECHO](https://echo.epa.gov/) (Enforcement and Compliance History Online) — ~3,000 operating Michigan Clean Air Act facilities, synced nightly via GitHub Actions
- **Regulated pollutants**: EPA ICIS-Air bulk download (pollutant descriptions, CAS numbers)
- **Address lookup**: [OpenStreetMap Nominatim](https://nominatim.openstreetmap.org/) (free geocoding)
- **Major roadways**: Census TIGER/Line (Interstates + US/State highways with 500m health impact buffer)

## Important Data Caveats

This tool shows **federal regulatory data from EPA ECHO only**. It does not measure actual air quality at your location. Key limitations:

- **HPV status lag**: EPA's records often trail Michigan EGLE's state-level actions. Most "High Priority Violation" facilities in Michigan have been addressed by EGLE but remain flagged in EPA's database. We distinguish these with amber markers and the label "Addressed by state."
- **State-regulated sources not included**: EGLE regulates many additional air pollution sources under state law that don't appear in federal data, including fugitive dust sources (asphalt plants, gravel pits, construction sites), small commercial operations (dry cleaners, auto body shops), and Rule 290 permit-by-rule facilities.
- **Other pollution types not included**: Water pollution (NPDES), contaminated sites (Superfund/brownfields), and hazardous waste (RCRA) are not shown.
- **Self-reported emissions**: TRI and greenhouse gas figures are reported by facilities to EPA, not independently measured.
- **Approximate locations**: EPA facility coordinates may not reflect exact facility footprints.
- **"No violations" is not "inspected and clean"**: Some facilities have never been evaluated by regulators. The tool shows inspection counts where available so users can distinguish.
- **Permanently closed facilities are excluded** from the map and search results.

For a broader view of Michigan air quality regulation, consult [EGLE's Air Quality Division](https://www.michigan.gov/egle/about/organization/air-quality).

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

The `?embed=true` parameter zooms the map to Metro Detroit and hides the standalone header/footer.

## Tech Stack

- **Frontend**: React 19, Vite, Leaflet, Tailwind CSS
- **Database**: Supabase (PostgreSQL + PostGIS for spatial queries)
- **Data sync**: Python script + GitHub Actions (nightly at 1:00 AM EST)
- **Hosting**: Vercel (frontend), Supabase (database)
- **Tests**: Vitest + React Testing Library

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm test

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

Runs automatically via GitHub Actions (`daily-air-sync.yml`) at 1:00 AM EST.

## License

MIT

## Credits

- **Planet Detroit** — [planetdetroit.org](https://planetdetroit.org)
- **Shelby Jouppi** — Original [air permit violation dashboard](https://github.com/Planet-Detroit/air-permit-violation-dashboard) and [EGLE database scraper](https://github.com/srjouppi/michigan-egle-database-auto-scraper)
- **EPA ECHO** — Facility and compliance data
