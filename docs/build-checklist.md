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
- [x] Log a Visit spec update — restaurant preview card, categorized tags,
      5-tag limit: linking a restaurant now shows a compact `RestaurantPreviewCard`
      (thumbnail, name, cuisine · area/city, price) instead of plain "✓ Linked"
      text; the tag picker is grouped into the same 5 labeled categories as
      Restaurant Detail (Cuisine/Occasion/Vibe/Price Point/Dietary, driven by
      each tag's real `category` column via a shared `groupByCategory()` in
      `src/lib/tags.ts`, also now used by `useRestaurantTagGroups`); tag
      selection is capped at 5 total with a live "Tags (N/5 selected)" counter
      and unselected chips grey out (new `Chip` `disabled` prop) once the cap
      is hit. Verified in the simulator, including a temporary forced-5-tags
      test to confirm the disabled state across all categories.
- [x] Dev auto sign-in — `EXPO_PUBLIC_DEV_SKIP_AUTH` now signs in for real as
      `EXPO_PUBLIC_DEV_DEMO_EMAIL`/`PASSWORD` (defaults to seeded Jordan)
      instead of a UI-only bypass, since per-user data needs a real `auth.uid()`
- [ ] Turn OFF "Confirm email" in Supabase dashboard if you want a *different*
      real account (not the seeded ones) to sign up and test with
- [ ] `src/lib/placeholder.ts` is now unused by Home/Discovery/Restaurant
      Detail/Profile/Social/Log a Visit — still used by Find for Me, Other
      User Profile, List Detail, Settings, Post view (not in this pass's scope)
- [ ] Regenerate `database.types.ts` from CLI once a Supabase login/token is set up
- [x] **Photo upload pipeline is live end-to-end** — Log a Visit's Photo field
      uses `expo-image-picker` (camera or library, via a native Alert chooser)
      instead of a dead "Tap to upload" box; on Save Entry the picked file is
      read with `expo-file-system`'s `File.arrayBuffer()` and uploaded to the
      already-correctly-configured `review-photos` bucket under the uploader's
      own `<uid>/<review_id>/` prefix, then recorded in `review_photos` (see
      `src/lib/photos.ts`, wired into `useSaveVisit`). Picking a photo (with no
      rating/notes) now also counts as "has review content," so a bare photo
      still creates a review to attach it to. Verified the bucket's RLS
      directly (own-folder writes succeed, other-uid writes correctly
      rejected, public read works unauthenticated) and the full write→display
      round trip via a real inserted `review_photos` row. Real photos (not the
      `[]`/gray placeholder) now render on Restaurant Detail's Food/Vibe/Tales
      cards and full review list, Social Feed's `FeedTile`s, and Profile's
      Gallery grid — each falls back to the existing placeholder when a review
      has no photo. Still not wired: Other User Profile / List Detail's
      gallery (still on `placeholder.ts`, out of this pass) and no
      multi-photo-per-review UI (schema supports it via `position`; Log a
      Visit only picks one for now).

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
- [x] **Discovery's search bar** now also queries live Places Text Search
      (`searchRestaurantsText`) — a "More from Google" section shows real
      places not already in our catalog (deduped by `google_place_id`), same
      find-or-create-and-open pattern as Log a Visit. `googlePlaces.ts` now
      shares one `normalizePlace()` between Details and Text Search, and also
      pulls `cuisine`/`about` from Google instead of leaving them blank.
- [x] **Real interactive maps** (`react-native-maps`) on Home's "Your Food
      Map" and Discovery's Map view — new `components/map/RestaurantMap`,
      grayscale custom pin markers, auto-fits to whatever pins it's given.
      Important: react-native-maps has native code Expo Go doesn't ship with —
      importing it there crashes the app (confirmed by reproducing it).
      `RestaurantMap` detects Expo Go and conditionally `require()`s the
      library only outside it, falling back to the original static/tappable
      pin layout (with an on-screen note) under Expo Go — so it's safe to
      preview now and the real map "just works" once run from a custom dev
      build, no code change needed then.
- [ ] **Build a custom EAS dev client** to actually see/test the real map —
      undecided, pending a call on whether it's worth setting up now.
- [ ] Dev seed still uses invented restaurants, not real ones — mid-flight:
      researched real, well-reviewed candidates per target neighborhood via
      Text Search; confirming the specific list before rewriting
      `0006_dev_seed.sql`.
- [ ] Two stray real-restaurant rows exist in `restaurants` from ad hoc Places
      testing this conversation (a "Kato Restaurant" in Los Angeles from
      earlier Log a Visit testing, and a "Sate Merah Tebet" from verifying
      Discovery's live search) — neither is part of the intentional seed.
      Anon/authenticated role can't delete from `restaurants` (no delete RLS
      policy, by design), so cleanup needs a direct DB connection — bundle it
      into the seed-rewrite migration.
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
- [ ] Push notifications, onboarding, empty states
