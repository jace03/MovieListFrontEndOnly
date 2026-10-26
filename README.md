# Halloween Watchlist 🎃

A just-for-fun React + TypeScript app for tracking mine and my wife's favourite Halloween movies.

Data lives in a shared Supabase Postgres table — no login, since it's just the two of us — so the list stays in sync across whichever browser/device either of us opens it on.

## Features

- Add, edit, and delete movies
- Track title, year, who picked it, a 🎃 rating (1-5), watched status, and notes
- Filter by All / Unwatched / Watched
- Shared, persisted storage via Supabase — no localStorage

## Getting started

1. Copy `.env.example` to `.env.local` — it already has the shared Supabase URL and publishable key, so no edits needed.
2. Install and run:

```bash
npm install
npm run dev
```

Then open the printed local URL in your browser.

## Backend

- Tables: `holidays`, `movies`, `actors`, `movie_actor` — see [`supabase/migrations/`](supabase/migrations/) for the schema, RLS policies, and the `auto_calculate_calendar` / `clear_calendar` functions behind the Calendar tab.
- Data: imported from the old MySQL `movieslist` database via [`supabase/movielist_dump.sql`](supabase/movielist_dump.sql).
- No auth: RLS is enabled but grants full read/write to the `anon` role, since there are no user accounts. Anyone with the published anon key can read/write the list — an accepted tradeoff for a two-person hobby app with no sensitive data.
- Client wiring: [`src/lib/supabaseClient.ts`](src/lib/supabaseClient.ts) (connection), [`src/lib/db.ts`](src/lib/db.ts) (all queries), and [`src/hooks/useMovies.ts`](src/hooks/useMovies.ts) / [`src/hooks/useHolidays.ts`](src/hooks/useHolidays.ts) (app state).

## Spec

This project is documented spec-first in [`openspec/`](openspec/) — see `openspec/changes/halloween-supabase-crud/` for the proposal, design, and task list behind the current Supabase backend.

## Tech

Vite + React + TypeScript + Supabase (Postgres + PostgREST), no auth.
