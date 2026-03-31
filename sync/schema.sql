-- ============================================
-- Pollution Near Me — Supabase Schema
-- Run this once in the Supabase SQL Editor
-- ============================================

-- Enable PostGIS if not already enabled
create extension if not exists postgis;

-- Air facilities table (synced nightly from EPA ECHO)
create table if not exists air_facilities (
  source_id text primary key,          -- ECHO SourceID (e.g., MI00000000000A9831)
  registry_id text,                     -- EPA Registry ID
  facility_name text not null,
  street text,
  city text,
  county text,
  zip text,
  lat double precision not null,
  lon double precision not null,
  geom geometry(Point, 4326),           -- PostGIS point for spatial queries

  -- Regulatory
  programs text,                        -- Comma-separated program codes (SIP, TVP, etc.)
  naics text,                           -- NAICS codes
  air_status text,                      -- Operating, Permanently Closed, etc.
  classification text,                  -- Major Emissions, Minor Emissions, etc.

  -- Compliance & Violations
  compliance_status text,               -- High Priority Violation, Violation w/in 1 Year, No Violation Identified
  hpv_status text,                      -- HPV detail
  months_with_hpv integer default 0,
  quarters_with_violations integer default 0,
  recent_violation_count integer default 0,
  violation_pollutants text,            -- Pollutants involved in recent violations
  last_violation_date date,

  -- Inspections
  evaluation_count integer default 0,
  last_evaluation_date date,

  -- Enforcement & Penalties
  formal_action_count integer default 0,
  informal_action_count integer default 0,
  penalties numeric(12,2) default 0,
  last_penalty_date date,

  -- Stack Tests
  last_stack_test_date date,
  last_stack_test_result text,

  -- Emissions (from TRI/GHG)
  tri_air_releases text,
  ghg_co2_releases text,

  -- Metadata
  last_synced_at timestamptz default now()
);

-- Spatial index for fast proximity queries
create index if not exists idx_air_facilities_geom
  on air_facilities using gist (geom);

-- Index for common filters
create index if not exists idx_air_facilities_compliance
  on air_facilities (compliance_status);

create index if not exists idx_air_facilities_status
  on air_facilities (air_status);

-- Sync log table
create table if not exists air_sync_log (
  id serial primary key,
  synced_at timestamptz default now(),
  facilities_total integer,
  facilities_updated integer,
  facilities_new integer,
  errors text
);

-- RPC function for spatial queries (used by the frontend)
create or replace function facilities_within_radius(
  p_lat double precision,
  p_lon double precision,
  radius_meters double precision
)
returns setof air_facilities
language sql
stable
as $$
  select *
  from air_facilities
  where st_dwithin(
    geom,
    st_setsrid(st_makepoint(p_lon, p_lat), 4326)::geography,
    radius_meters
  )
  and air_status is distinct from 'Permanently Closed'
  order by
    case compliance_status
      when 'High Priority Violation' then 1
      when 'Violation w/in 1 Year' then 2
      else 3
    end,
    facility_name;
$$;

-- Regulated pollutants per facility (from ICIS-Air bulk download)
create table if not exists air_facility_pollutants (
  id serial primary key,
  source_id text not null,
  pollutant_code text,
  pollutant_desc text not null,
  cas_number text,
  unique(source_id, pollutant_desc)
);

create index if not exists idx_facility_pollutants_source
  on air_facility_pollutants(source_id);

-- Enable RLS (Row Level Security) with public read access
alter table air_facilities enable row level security;

create policy "Public read access for air_facilities"
  on air_facilities for select
  using (true);

alter table air_facility_pollutants enable row level security;

create policy "Public read access for air_facility_pollutants"
  on air_facility_pollutants for select
  using (true);

alter table air_sync_log enable row level security;

create policy "Public read access for air_sync_log"
  on air_sync_log for select
  using (true);
