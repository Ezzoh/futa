-- Run this in the Supabase SQL editor to create the GoalPulse data table.
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  league text not null check (league in ('EPL','LALIGA','BUNDESLIGA','SERIEA','LIGUE1','UCL','UEL')),
  home_team text not null,
  away_team text not null,
  home_score int,
  away_score int,
  status text not null default 'scheduled' check (status in ('scheduled','live','finished','postponed')),
  minute int,
  kickoff timestamptz not null,
  venue text,
  watch_links jsonb not null default '[]'::jsonb, -- [{ "label": "Sky Sports", "url": "https://..." }]
  updated_at timestamptz not null default now()
);

create index if not exists matches_kickoff_idx on public.matches (kickoff);

alter table public.matches enable row level security;

drop policy if exists "Public read" on public.matches;
create policy "Public read" on public.matches for select using (true);

-- Enable live score push updates
alter publication supabase_realtime add table public.matches;
