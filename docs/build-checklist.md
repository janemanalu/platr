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
- [x] Restaurant Detail (`13:7914`) — ONE continuous scroll: banner, name +
      Log a Visit, cuisine/price/location, tag groups, About + website,
      "Reviews — you & friends" (Food/Vibe/Tales cards: avg score /10, preview,
      reviewer, per-card See all reviews → `/reviews/[restaurantId]?category=`),
      full-width "+ LOG A VISIT" at the end
- [x] Log a Visit (`13:2948`, `13:3829`) — restaurant search, Food/Vibe
      RatingSliders, notes, photo upload stub, status grid, friend tagging, tag
      picker, anon suggestion, Save Entry (form state only; no insert yet)
- [x] Profile (`13:5811`, `13:6351`) — header + stats, 4 status sections with
      per-section privacy toggles, inline Create a List form (`13:6892`), gallery grid
- [x] Social Feed (`13:4270`, `13:4824`) — Friends/Everyone toggle, story bubbles,
      Share-your-last-meal nudge, 2-col feed grid with featured cards
- [x] Post view (`/post/[id]`, modal) — photo, author, restaurant, F/V scores,
      notes, like/comment counts (like toggles; counts static)
- [x] Find for Me (`13:2611`) — Occasion / Mood / Budget chip groups, Show me ✦,
      inline results
- [x] Other User Profile (`13:5378`) — mutual friends, Follow toggle, public
      sections only (read-only privacy), gallery
- [x] Settings — minimal: account card, preference rows (stubs), sign out
- [x] List Detail (`13:8356`) — `?variant=` cards / list-rows / wishlist-rows / gallery

## Auth (no Figma design — minimal build)

- [x] Sign up / sign in screen (email + password) — `(auth)/sign-in.tsx`
- [x] Session gate / redirect (unauthed → auth screen) — `Stack.Protected` + `AuthProvider`
- [x] Profile bootstrap: `username` / `display_name` passed on sign-up (DB trigger creates profile)
- [ ] Edit profile in Settings (Settings screen is stub + sign-out only)
- [ ] Email-confirmation UX polish / resend
- [ ] Remove the `EXPO_PUBLIC_DEV_SKIP_AUTH` escape hatch before any release build

## Backend follow-ups

- [x] `0006_dev_seed.sql` (+ 0007 follow-up) — 6 real restaurants, 6 real auth
      users (Jordan + 5 friends, password `platr-dev-2026`), follows, 16
      logs+reviews, review_tags, likes, comments
- [x] Data hooks layer — `src/hooks/`: useProfile, useStreak, useUserLogs/
      useProfileSections, useStatusPrivacy, useFollowStats, useFollowing/
      useIsFollowing/useToggleFollow, useRestaurants/useRestaurant,
      useRestaurantReviews/useReviewCategories, useRestaurantTagGroups,
      useSocialFeed (friends/everyone/one review/my-last-review),
      useHomeRecommendations, useGalleryPhotos, useTags, useSaveVisit
- [x] Home, Discovery, Restaurant Detail, Profile, Social Feed all replaced
      `src/lib/placeholder.ts` with real Supabase queries (via TanStack Query)
- [x] Streak wired to `current_streak()` RPC (real, verified: reads 3 for the
      seeded Jordan account)
- [x] `restaurant_scores` / `restaurant_tags_view` wired into Home, Discovery,
      and Restaurant Detail
- [x] **Log a Visit's Save Entry now actually inserts** — upserts the log
      (one per user+restaurant), inserts a review with tags/friend-tags when
      there's rating/notes content, inserts the anonymous suggestion
      separately. Full chain verified end-to-end outside the simulator (can't
      tap "Save Entry" via automation): the exact Supabase operations the
      mutation performs were run directly and all succeeded (upsert, review
      insert with auto-synced user/restaurant via the DB trigger, review_tags,
      review_friend_tags, review_suggestions), then cleaned up. Screen itself
      verified rendering correctly with a real restaurant prefilled and
      "✓ Linked" showing.
- [x] Dev auto sign-in — `EXPO_PUBLIC_DEV_SKIP_AUTH` now signs in for real as
      `EXPO_PUBLIC_DEV_DEMO_EMAIL`/`PASSWORD` (defaults to seeded Jordan)
      instead of a UI-only bypass, since per-user data needs a real `auth.uid()`
- [ ] Turn OFF "Confirm email" in Supabase dashboard if you want a *different*
      real account (not the seeded ones) to sign up and test with
- [ ] `src/lib/placeholder.ts` is now unused by Home/Discovery/Restaurant
      Detail/Profile/Social/Log a Visit — still used by Find for Me, Other
      User Profile, List Detail, Settings, Post view (not in this pass's scope)
- [ ] Regenerate `database.types.ts` from CLI once a Supabase login/token is set up

## Social features — tables exist, UI not built

- [ ] Likes on reviews (button, count, list)
- [ ] Comments on reviews (thread, compose)
- [ ] Follow / unfollow actions + follower/following lists
- [ ] "Find users" search (Social Feed)
- [ ] Friend tagging UI in Log a Visit
- [ ] Anonymous suggestion/complaint submit in Log a Visit

## Google Places (Step 5)

- [x] `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY` in `.env` (also covers Maps SDK
      iOS/Android for whenever real map rendering lands)
- [x] `src/lib/googlePlaces.ts` — Autocomplete + Place Details (New API),
      price-level mapping, photo URL construction. Verified live: autocomplete
      and details both return real results against the actual API.
- [x] `src/lib/restaurants.ts#upsertRestaurantFromPlace` — find-or-create in
      `restaurants` keyed on `google_place_id`.
- [x] `components/restaurant/PlaceSearchField` — debounced autocomplete
      dropdown + resolve-on-select; wired into **Log a Visit**'s restaurant
      field.
- [x] End-to-end verified outside the simulator (autocomplete → details →
      Supabase select-or-insert) with a real query — every step returned real
      data. The insert step correctly failed with an RLS 42501 under the anon
      key, as expected (no auth session) — inserting for real needs a signed-in
      user, i.e. dev-skip-auth won't cut it for this one. Turn off "Confirm
      email" (see Backend follow-ups) and sign up for real to test the write.
- [ ] **Discovery's search bar** — still filters the local placeholder list
      only, not wired to live Places search. Deliberately scoped out of this
      pass; revisit if Discovery should support searching real-world places
      beyond the curated/logged set.

## Fixes

- [x] **Type scale corrected against actual Figma pixel values** — the original
      `theme/index.ts` scale was estimated, not derived, and ran 1–3px large
      almost everywhere (`sectionLabel` was 11px vs Figma's 9px, `body`/
      `bodyStrong`/`cardTitle` were 13px vs 11px, etc.). Re-derived every value
      from the raw Figma JSX across Home/Discovery/Restaurant Detail/Log a
      Visit; added `micro` (8px) and `modalTitle` (12px bold uppercase) tiers.
      Verified the correction on Home, Restaurant Detail, Log a Visit, Profile,
      **and** — full pass — Social Feed, Find for Me, Other User Profile,
      List Detail, Settings, Post view: all clean, no regressions, nothing
      illegibly small.
- [x] **Discovery list rebuilt to match `13:2142` exactly** (re-pulled fresh,
      not from memory): 48×48 thumbnails (was already 48 in code, but read
      large next to oversized text — fixed by the scale correction above),
      compact non-stretching Map/List pill toggle, outlined (not filled)
      "✦ Find for me" + Filters buttons, each result row now its own bordered
      card (was one list with dividers) with rectangular `MicroTag` chips (not
      pills) instead of the pill `Chip`, `#f5f5f5`-toned results background.
      New component: `restaurant/MicroTag`.
- [x] Clarified: the gear icon that appeared to "overlap" the Find for Me
      button in screenshots is Expo Go's own floating dev-menu button — not
      app code, doesn't exist in a production build, no z-index bug found.

- [x] "The action 'GO_BACK' was not handled" — the root layout used to mount a
      bare loading `View` (no `<Stack>` at all) until the auth check resolved,
      so a cold deep link into a nested screen had no stable navigator to land
      in. Now the `<Stack>` mounts immediately and the native splash screen
      covers the brief `initializing` window instead (`expo-splash-screen`).
      Also added `src/lib/nav.ts#goBack()` — checks `router.canGoBack()` before
      popping, replacing every raw `router.back()` call in the app — so a
      genuinely history-less back tap redirects to a sane fallback instead of
      warning.
- [x] Added a global `ErrorBoundary` (`src/components/system`) around the
      navigator as a last-resort net for render-time errors.
- [x] Tab bar "+" — raised into a proper floating action button above the bar
      instead of sitting inline with the icon+label tabs (was reading as a
      cramped, label-less fifth tab).
- [x] Settings "Sign out" now surfaces errors and shows a loading state instead
      of firing-and-forgetting the promise.

## Later passes (explicitly deferred)

- [ ] Visual design pass — brand color, custom fonts, real imagery, polish
- [ ] Map rendering (real map SDK) for Home "Food Map" + Discovery map
      (currently gray placeholder boxes with pins)
- [ ] Log a Visit → actually insert log + review + children on Save
- [ ] Restaurant search in Log a Visit / Discovery wired to real data
- [ ] Photo upload pipeline to `review-photos` bucket
- [ ] Push notifications, onboarding, empty states
