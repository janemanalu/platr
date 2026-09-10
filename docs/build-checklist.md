# Platr — build checklist

Living list of what's done and what's left. Updated as the build progresses.

## Done

- [x] **Project setup** — Expo SDK 57, expo-router, TypeScript, `src/` layout
- [x] Git repo + private GitHub `janemanalu/platr`, `.gitignore` (`.env` protected)
- [x] Design tokens (`src/theme`) — grayscale, flat, system font
- [x] Base UI primitives — `Text`, `Card`, `Button`, `Chip`, `Screen`
- [x] Supabase client (`src/lib/supabase.ts`) + hand-maintained `database.types.ts`
- [x] **Database schema** — 15 tables, RLS, views, functions, tag seed; applied to
      project `fpcpmoczjocscmckrjzh` and pushed

- [x] **Navigation structure** — `(tabs)` (Home / Discover / Social / Profile) +
      center "+" FAB → Log a Visit modal; root stack for Restaurant Detail, List
      Detail, User Profile, Find for Me, Post view, Settings; `(auth)` group with
      `Stack.Protected` session gate. All screens are stubs (`ScreenStub`) wired
      with their real routes.

## Screens to build (from Figma, in order)

- [x] Home (`13:9`, `13:1207`) — header, greeting, streak, food map, Tastes Like
      You / Trending carousels, Wishlist. Placeholder data (`src/lib/placeholder.ts`).
- [x] Discovery — list (`13:2142`) + map placeholder (`13:1807`), search, Map/List
      toggle, expandable filter chips, ✦ Find for me
- [x] Restaurant Detail (`13:7914`) — banner, name + Log a Visit, tag groups,
      About + website, review blocks, sticky + Log a Visit CTA
- [x] Log a Visit (`13:2948`, `13:3829`) — restaurant search, Food/Vibe
      RatingSliders, notes, photo upload stub, status grid, friend tagging, tag
      picker, anon suggestion, Save Entry (form state only; no insert yet)
- [ ] Profile (`13:5811`, `13:6351`) + inline Create a List (`13:6892`)
- [ ] Social Feed (`13:4270`, `13:4824`) + Post view overlay
- [ ] Find for Me (`13:2611`)
- [ ] Other User Profile (`13:5378`)
- [ ] Settings — **no Figma node**; minimal screen (from Home avatar tap)
- [ ] List Detail (`13:8356`) — cards / wishlist-rows / list-rows / gallery variants

## Auth (no Figma design — minimal build)

- [x] Sign up / sign in screen (email + password) — `(auth)/sign-in.tsx`
- [x] Session gate / redirect (unauthed → auth screen) — `Stack.Protected` + `AuthProvider`
- [x] Profile bootstrap: `username` / `display_name` passed on sign-up (DB trigger creates profile)
- [ ] Edit profile in Settings (Settings screen is stub + sign-out only)
- [ ] Email-confirmation UX polish / resend
- [ ] Remove the `EXPO_PUBLIC_DEV_SKIP_AUTH` escape hatch before any release build

## Backend follow-ups

- [ ] Turn OFF "Confirm email" in Supabase dashboard for dev (Authentication →
      Sign In / Providers → Email) so sign-up logs you straight in
- [ ] `0006_dev_seed.sql` — sample restaurants/users/reviews (wireframe names) for
      building against
- [ ] Replace `src/lib/placeholder.ts` with real Supabase queries per screen
- [ ] Data hooks layer (`src/hooks` / queries) per screen
- [ ] Streak wired to `current_streak()` RPC
- [ ] `restaurant_scores` / `restaurant_tags_view` wired into Home + Detail
- [ ] Regenerate `database.types.ts` from CLI once a Supabase login/token is set up

## Social features — tables exist, UI not built

- [ ] Likes on reviews (button, count, list)
- [ ] Comments on reviews (thread, compose)
- [ ] Follow / unfollow actions + follower/following lists
- [ ] "Find users" search (Social Feed)
- [ ] Friend tagging UI in Log a Visit
- [ ] Anonymous suggestion/complaint submit in Log a Visit

## Google Places (Step 5)

- [ ] `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY` in `.env`
- [ ] Places lib — autocomplete + details → upsert `restaurants`
- [ ] Restaurant search in Log a Visit + Discovery wired to Places

## Later passes (explicitly deferred)

- [ ] Visual design pass — brand color, custom fonts, real imagery, polish
- [ ] Map rendering (real map SDK) for Home "Food Map" + Discovery map
      (currently gray placeholder boxes with pins)
- [ ] Log a Visit → actually insert log + review + children on Save
- [ ] Restaurant search in Log a Visit / Discovery wired to real data
- [ ] Photo upload pipeline to `review-photos` bucket
- [ ] Push notifications, onboarding, empty states
