# Platr — notes for agents

**Expo SDK 57.** Check the versioned docs at https://docs.expo.dev/versions/v57.0.0/
before writing Expo/RN code — APIs have changed.

## What this is

"Social media, but for F&B." React Native + Expo (managed), TypeScript,
expo-router, Supabase backend, Google Places for restaurant data.

## Conventions

- Routes live in `src/app` (expo-router, `src/` layout, alias `@/*` → `src/*`).
- All UI is built from the primitives in `src/components/ui` — `Text`, `Card`,
  `Button`, `Chip`, `Screen`. Add to that set rather than reaching for raw
  `<Text>`/`<View>` styling.
- Design tokens are in `src/theme` (Coral + Lime). Use the semantic roles
  (`colors`, `tagTones`, `type`, `shadow`, `radius`) — never hardcode hex.
  Coral is the primary-action color, Lime the accent. Fonts: Barriecito for
  headings/wordmark/big numbers, Inclusive Sans for everything else.
- Build from the colored "Coral + Lime ✦ Designed" side of each Figma frame,
  not the gray wireframe beside it.
- Screens are built from the Figma file (source of truth) — pull the real node,
  don't guess layout.
- `.env` is gitignored and must never be committed. Keys are `EXPO_PUBLIC_*`.

## Demo data — not facts

- The six `@platr.dev` accounts (dev password in `supabase/migrations/20260914170858_dev_seed.sql`)
  and everything they wrote are **demo data**: logs, reviews, ratings (incl. the Service values from
  `20261013090110_dev_seed_service_ratings.sql`), tags, follows, likes, comments.
- The six restaurants are **real Jakarta businesses** (Google Places): Morimoto Jakarta, Estella
  Indonesian Family Restaurant, Yialos Taverna Menteng, The Nineteen Jakarta, D'Arabicah Restaurant,
  Nasi Telur Sinchan - Salemba. The demo reviews about them are invented, and so are the dietary tags
  from `20261025090000_dev_seed_dietary_tags.sql` (Halal, Vegetarian, Gluten-free) — **demo claims, not
  facts**. Never present them as real information.
- Before real testers join: remove or hide every `@platr.dev` account, review and tag (tracked in
  `docs/build-checklist.md`).

## Tracker workflow

- **At the start of every session**: run `git pull`, then read `AGENTS.md`,
  `docs/DECISIONS.md`, and `docs/TRACKER.csv` — in that order, before
  anything else.
- **At the end of every task**: update only the tracker rows that task
  actually touched — `Status`, `Last verified`, `Source`, `Notes`. Mark a row
  **Done** only after a live database test or a device check, never from
  code existing alone. Commit and push `docs/TRACKER.csv` together with the
  code it documents.
- **After each task**, print a "Tracker update" — a short list of just the
  rows that changed (ID, old → new Status, one-line why) — so it can be
  pasted straight into the planning chat.

