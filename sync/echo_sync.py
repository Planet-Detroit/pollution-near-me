#!/usr/bin/env python3
"""
Sync Michigan Clean Air Act facility data from EPA ECHO to Supabase.
Runs nightly via GitHub Actions.

Usage:
    python echo_sync.py

Requires environment variables:
    SUPABASE_URL
    SUPABASE_SERVICE_KEY  (service role key for write access)
"""

import csv
import io
import json
import os
import sys
from datetime import datetime, timezone

import requests
from supabase import create_client

# --- Configuration ---

ECHO_BASE = "https://echodata.epa.gov/echo/air_rest_services"

# Columns to request from ECHO (by column number)
# See: https://echo.epa.gov/tools/web-services/facility-search-air
ECHO_COLUMNS = ",".join(str(c) for c in [
    1,   # AIRName
    2,   # SourceID
    3,   # AIRStreet
    4,   # AIRCity
    7,   # AIRZip
    8,   # RegistryID
    9,   # AIRCounty
    22,  # AIRNAICS
    23,  # FacLat
    24,  # FacLong
    25,  # AIRPrograms
    27,  # AIRStatus
    29,  # AIRClassification
    # Compliance & Violations (verified column numbers)
    44,  # AIRComplStatus
    45,  # AIRHpvStatus
    46,  # AIRMnthsWithHpv
    48,  # AIRQtrsWithViol
    49,  # AIRPollRecentViol
    50,  # AIRRecentViolCnt
    51,  # AIRLastViolDate
    # Inspections
    52,  # AIREvalCnt
    # Stack Tests
    64,  # AIRLastStckTestDate
    65,  # AIRLastStckTestResults
    # Enforcement & Penalties
    76,  # AIRIeaCnt
    77,  # AIRFeaCnt
    85,  # AIRPenalties
    86,  # AIRLastPenaltyDate
    # Emissions
    71,  # FacTRIAIRReleases
    75,  # FacGHGCO2Releases
])


def get_echo_data():
    """Query ECHO API for all Michigan CAA facilities and download as CSV."""
    print("Step 1: Querying ECHO for Michigan CAA facilities...")

    # Step 1: Create query
    resp = requests.get(f"{ECHO_BASE}.get_facilities", params={
        "output": "JSON",
        "p_st": "MI",
        "p_p": "Y",  # include penalties
    }, timeout=60)
    resp.raise_for_status()

    result = resp.json().get("Results", {})
    qid = result.get("QueryID")
    total = result.get("QueryRows")
    print(f"  Found {total} facilities (QueryID: {qid})")

    if not qid:
        raise RuntimeError("Failed to get QueryID from ECHO")

    # Step 2: Download CSV
    print("Step 2: Downloading facility data as CSV...")
    resp = requests.get(f"{ECHO_BASE}.get_download", params={
        "output": "CSV",
        "qid": qid,
        "qcolumns": ECHO_COLUMNS,
    }, timeout=120)
    resp.raise_for_status()

    reader = csv.DictReader(io.StringIO(resp.text))
    rows = list(reader)
    print(f"  Downloaded {len(rows)} rows")
    return rows


def parse_date(date_str):
    """Parse ECHO date strings (MM/DD/YYYY) to ISO format, or return None."""
    if not date_str or date_str.strip() == "":
        return None
    try:
        return datetime.strptime(date_str.strip(), "%m/%d/%Y").strftime("%Y-%m-%d")
    except ValueError:
        return None


def parse_int(val):
    """Parse a string to int, defaulting to 0."""
    if not val or val.strip() == "":
        return 0
    try:
        return int(val.strip())
    except ValueError:
        return 0


def parse_float(val):
    """Parse a string (possibly with $ and commas) to float, defaulting to 0."""
    if not val or val.strip() == "":
        return 0.0
    try:
        return float(val.strip().replace("$", "").replace(",", ""))
    except ValueError:
        return 0.0


def transform_row(row):
    """Transform an ECHO CSV row into a Supabase record."""
    lat = parse_float(row.get("FacLat"))
    lon = parse_float(row.get("FacLong"))

    # Skip rows without valid coordinates
    if lat == 0 or lon == 0:
        return None

    return {
        "source_id": row.get("SourceID", "").strip(),
        "registry_id": row.get("RegistryID", "").strip(),
        "facility_name": row.get("AIRName", "").strip(),
        "street": row.get("AIRStreet", "").strip(),
        "city": row.get("AIRCity", "").strip(),
        "county": row.get("AIRCounty", "").strip(),
        "zip": row.get("AIRZip", "").strip(),
        "lat": lat,
        "lon": lon,
        # PostGIS point — Supabase accepts WKT or GeoJSON
        "geom": f"SRID=4326;POINT({lon} {lat})",
        "programs": row.get("AIRPrograms", "").strip(),
        "naics": row.get("AIRNAICS", "").strip(),
        "air_status": row.get("AIRStatus", "").strip(),
        "classification": row.get("AIRClassification", "").strip(),
        "compliance_status": row.get("AIRComplStatus", "").strip(),
        "hpv_status": row.get("AIRHpvStatus", "").strip(),
        "months_with_hpv": parse_int(row.get("AIRMnthsWithHpv")),
        "quarters_with_violations": parse_int(row.get("AIRQtrsWithViol")),
        "recent_violation_count": parse_int(row.get("AIRRecentViolCnt")),
        "violation_pollutants": row.get("AIRPollRecentViol", "").strip(),
        "last_violation_date": parse_date(row.get("AIRLastViolDate")),
        "evaluation_count": parse_int(row.get("AIREvalCnt")),
        "last_evaluation_date": parse_date(row.get("AIRLastEvalDate")),
        "formal_action_count": parse_int(row.get("AIRFeaCnt")),
        "informal_action_count": parse_int(row.get("AIRIeaCnt")),
        "penalties": parse_float(row.get("AIRPenalties")),
        "last_penalty_date": parse_date(row.get("AIRLastPenaltyDate")),
        "last_stack_test_date": parse_date(row.get("AIRLastStckTestDate")),
        "last_stack_test_result": row.get("AIRLastStckTestResults", "").strip(),
        "tri_air_releases": row.get("FacTRIAIRReleases", "").strip(),
        "ghg_co2_releases": row.get("FacGHGCO2Releases", "").strip(),
        "last_synced_at": datetime.now(timezone.utc).isoformat(),
    }


def sync_to_supabase(records):
    """Upsert all records to Supabase air_facilities table."""
    url = os.environ["SUPABASE_URL"]
    key = os.environ["SUPABASE_SERVICE_KEY"]

    supabase = create_client(url, key)

    print(f"Step 3: Upserting {len(records)} facilities to Supabase...")

    # Upsert in batches of 500
    batch_size = 500
    updated = 0

    for i in range(0, len(records), batch_size):
        batch = records[i:i + batch_size]
        result = supabase.table("air_facilities").upsert(
            batch,
            on_conflict="source_id"
        ).execute()
        updated += len(batch)
        print(f"  Upserted {updated}/{len(records)}...")

    # Log the sync
    supabase.table("air_sync_log").insert({
        "facilities_total": len(records),
        "facilities_updated": updated,
        "facilities_new": 0,  # We don't track new vs updated separately
        "errors": None,
    }).execute()

    print(f"Sync complete: {updated} facilities upserted")
    return updated


def main():
    try:
        # Download from ECHO
        rows = get_echo_data()

        # Transform
        records = []
        skipped = 0
        for row in rows:
            record = transform_row(row)
            if record and record["source_id"]:
                records.append(record)
            else:
                skipped += 1

        print(f"  Transformed {len(records)} records ({skipped} skipped - no coordinates)")

        # Sync to Supabase
        updated = sync_to_supabase(records)

        print(f"\nDone! {updated} Michigan CAA facilities synced to Supabase.")

    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)

        # Try to log the error
        try:
            url = os.environ.get("SUPABASE_URL")
            key = os.environ.get("SUPABASE_SERVICE_KEY")
            if url and key:
                supabase = create_client(url, key)
                supabase.table("air_sync_log").insert({
                    "facilities_total": 0,
                    "facilities_updated": 0,
                    "facilities_new": 0,
                    "errors": str(e),
                }).execute()
        except Exception:
            pass

        sys.exit(1)


if __name__ == "__main__":
    main()
