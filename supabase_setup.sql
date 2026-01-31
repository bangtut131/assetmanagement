-- Copy this entire file content.
-- Go to Supabase Dashboard -> SQL Editor.
-- Paste and Run.

-- 1. Enable UUID Extension
create extension if not exists "uuid-ossp";

-- 2. Create Users Table
create table if not exists public.users (
  id text primary key,
  username text unique not null,
  password text not null, -- Plain text for compatibility with current app
  name text not null,
  role text not null check (role in ('SUPER_ADMIN', 'MANAGER', 'STAFF', 'AUDITOR', 'VIEWER')),
  status text not null default 'pending' check (status in ('active', 'pending', 'rejected')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Locations Table
create table if not exists public.locations (
  id text primary key,
  name text not null,
  parent_id text references public.locations(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create Assets Table
create table if not exists public.assets (
  id text primary key,
  name text not null,
  category text,
  location_id text references public.locations(id), -- Optional FK
  price numeric,
  purchase_date text,
  useful_life integer,
  status text,
  barcode text,
  image text,
  deletion_status text,
  deletion_request_date text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Create Audit Logs Table
create table if not exists public.audit_logs (
  id text primary key default uuid_generate_v4()::text,
  action text not null,
  target text not null,
  details text,
  timestamp text not null,
  "user" text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Create Audit Sessions Table
create table if not exists public.audit_sessions (
  id text primary key,
  name text not null,
  start_date text not null,
  end_date text,
  auditor_name text,
  status text not null,
  scanned_assets jsonb default '[]'::jsonb,
  missing_assets jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Enable RLS and Policies (Public Access for MVP)
alter table public.users enable row level security;
do $$ begin
  create policy "Public access for users" on public.users for all using (true);
exception when duplicate_object then null; end $$;

alter table public.assets enable row level security;
do $$ begin
  create policy "Public access for assets" on public.assets for all using (true);
exception when duplicate_object then null; end $$;

alter table public.locations enable row level security;
do $$ begin
  create policy "Public access for locations" on public.locations for all using (true);
exception when duplicate_object then null; end $$;

alter table public.audit_logs enable row level security;
do $$ begin
  create policy "Public access for logs" on public.audit_logs for all using (true);
exception when duplicate_object then null; end $$;

alter table public.audit_sessions enable row level security;
do $$ begin
  create policy "Public access for sessions" on public.audit_sessions for all using (true);
exception when duplicate_object then null; end $$;
