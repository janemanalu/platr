# Platr — agreed decisions

Summary of the rules that are actually implemented (or, where noted, still
pending) as of **5 Nov 2026**. Each section cites the migration or file it
comes from, so it can be re-checked against the code rather than taken on
faith. This file is a summary, not a spec — the migrations themselves are the
source of truth; if the two ever disagree, the code wins and this file is
stale.

## Scoring

Source: `supabase/migrations/20261013090300_scores.sql`

- Only restaurants have a Platr score. One vote per person: their **most
  recent** visit with ratings, from a Visited, Go-To, or Blacklisted log —
  never Wishlist.
- Three components, each averaged separately then shrunk toward a prior:
  - **Food** — the food itself.
  - **Vibe** — atmosphere and concept (noise, music, decor).
  - **Service** — staff and speed.
  - `shrunk = (n · avg + PRIOR_WEIGHT · PRIOR_MEAN) / (n + PRIOR_WEIGHT)`
  - A visit logged before Service existed counts toward Food and Vibe only.
- **Platr score** = `0.50 · food + 0.25 · service + 0.25 · vibe` (all three
  already shrunk). Shown only once **3** people have rated a place; below
  that the app shows "New · N ratings" instead of a number.
- Current constants (named SQL functions, tunable in one place): prior mean
  **7.0**, prior weight **5**, min raters **3**, weights **50/25/25**.
- **Spice Level never feeds any score** — display only.
- **Friends' score is separate** (`friends_score()`), never blended into the
  Platr score: plain averages (no shrinkage) over people the caller follows,
  latest visit each, Visited/Go-To only, in a section that's actually public
  to the caller.
- Below the 3-rater floor, the view still returns a `rating_count` so the app
  can show "New · N ratings" — but never the averages themselves, since 1–2
  raters would de-anonymize a private rating.

## Privacy

Source: `supabase/migrations/20261013090200_visibility_rules.sql`

- Every profile list — **Go-To, Visited, Wishlist, Blacklisted** — has its
  own public/private toggle. New-profile defaults: Go-To and Visited
  **public**, Wishlist and Blacklisted **private**.
- A visit is a **post** only when its log is Visited or Go-To. Wishlist and
  Blacklisted visits never show as posts to anyone else, even if that
  section is public — the section then shows just the restaurant, not the
  visit's ratings or notes. One function, `review_is_visible()`, enforces
  this everywhere: likes, comments, review tags, media, and logged stories
  all check through it.
- **Gallery** has its own separate public/private flag on the profile
  (`profiles.gallery_public`, default **public**). Controls the Gallery
  section only — the same photos still show inside posts wherever that post
  is visible regardless of the Gallery flag.
- **Feed visibility follows list (status) privacy** — a friend's post only
  reaches your feed if the underlying status section is public and the
  specific log is Visited/Go-To, per `review_is_visible()`.

## Tags

Source: `supabase/migrations/20261013090000_tag_category_local_flavor.sql`,
`20261013090100_reviews_spice_story_tags.sql`

- **6 categories**: cuisine, occasion, vibe, price_point, dietary, and the
  new **local_flavor** (Jakarta-specific: Worth Queueing For, Warteg Energy,
  Portion King, Rainy Day Comfort, Late Night Cravings, Family-Style
  Sharing).
- **Max 5 tags per visit, across all categories combined** — enforced in the
  database (`review_tags_max_five` trigger, not just the app), so a
  multi-row insert of 6+ in one statement is rejected too.
- Tags are never deleted, only retired: `tags.is_active = false` hides a tag
  from the Log a Visit picker while visits that already used it keep showing
  it. Retired this pass: Pasta, Wood-fired, Anniversary, Group Hangout, Quick
  Bite, Dim Lighting, Intimate, Adventurous, Familiar, Fancy, Casual.
  Celebration stays active (Find for Me's "Celebration" occasion maps to
  it).
- `tags.sort_order` drives picker order (Figma order first, everything else
  alphabetical at the default 100).
- Food/Vibe/Service ratings are **required** on every Visited, Go-To, or
  Blacklisted visit (`reviews_require_ratings` trigger) — but only checked
  on insert/update of those columns, so visits saved before Service existed
  stay valid until someone edits their scores.

## Decide Together

Source: `supabase/migrations/20261013090800_decide_together.sql`

- A **session**: an organizer invites people; each participant submits
  dietary needs and, with **explicit per-session consent**, the wishlist
  places they're happy to share (they can untick any). Platr adds
  `platr_pick` candidates to fill gaps. Everyone votes; the organizer locks
  the final pick.
- **Privacy is the core design constraint**:
  - Visible only to that session's participants.
  - Wishlists themselves stay private — the only way a wishlist place enters
    a session is the user inserting their own `decision_candidates` row,
    after consenting for that specific session.
  - **Nobody ever sees whose wishlist a place came from** — not other
    participants, not the person who shared it, not the decision card, not
    notifications. Each person sees only their own picks
    (`my_decision_candidates`) and can untick them.
  - Results show **counts only** ("On 3 of 4 wishlists"), never names.
  - A place on exactly **one** wishlist never appears in Results, at any
    group size (in a pair, that would obviously identify whose it is).
    Results = places on 2+ wishlists, plus Platr picks that are on no
    wishlist.
  - Clients can't read `decision_candidates` rows directly at all — even
    counting them client-side would leak the same information everything
    else protects. All of this goes through server-side functions.
  - Votes on the final pick **are** visible to participants (not anonymous).
- **Dietary needs never drop a place.** Anything not tagged for every
  participant's need goes into a separate "not confirmed" group that names
  which needs are unconfirmed, rather than being silently excluded.
- **Lifecycle**: sessions close **24h after creation** (`closes_at`). An open
  session past `closes_at` counts as closed immediately (computed by query,
  not a cron job). After closing, only people who actually submitted count
  toward results. The organizer can extend **once**, by 24h (e.g. if only
  they submitted), or fall back to Find for Me.

Note: **Stories** have their own, separate 24h rule — a story expires 24h
after posting regardless of any Decide Together session
(`supabase/migrations/20261013090400_stories_reports.sql`). Followers-only;
a logged story mirrors a Visited/Go-To review's cover photo (or its note as
a text slide with no photo), a freeform story is photo + optional caption +
optional place tag and never creates a post or touches any score.

## Share cards

Source: Figma "Share Cards" board (`117:2`, file `jlDu1cXeJZfmi5ocC6Dris`) +
tracker notes — **not yet implemented in code** (T45, status Later).

- 4 lanes: **restaurant, post, list, decision** (one share-card design per
  content type).
- 2 sizes per lane: **1080×1350** (chat/feed-style share) and **1080×1920**
  (story-style share).
- Planned build order: plain share-sheet image first (T45); "Add from
  Share" — importing a place from someone else's share — later (T46); direct
  Instagram Stories sharing later still, needs a Meta app ID + a dev build
  (T47).

## Auth

Source: `supabase/migrations/20261013090600_profiles_settings_search.sql`,
`AGENTS.md`, tracker T21/T35.

- Email + password sign-up/sign-in is built today (`(auth)/sign-in.tsx`,
  pre-Phase-2 screen, due for restyle per T35).
- `username_available()` — a DB function, live availability check used on
  Sign Up (callable by `anon` and `authenticated`).
- **Signing in by username is explicitly planned, not built.** The
  migration comment is explicit: "no function ever returns an email" —
  i.e. whatever resolves a username to an account for sign-in must do it
  server-side (rate-limited Edge Function, T21) without ever exposing the
  underlying email address to the client, to the user, or in an error
  message.
- Google and Apple sign-in are planned (T35) but have no code yet — no
  `expo-apple-authentication` / `expo-auth-session` dependency in the repo
  as of this check. Needs Esther to do the Google/Apple console setup first.
- `EXPO_PUBLIC_DEV_SKIP_AUTH` is a dev-only auto-sign-in escape hatch
  (`__DEV__`-gated) — **must be removed before any release build** (tracked
  in both `AGENTS.md` and the build checklist).

## Store requirements (user content)

Source: tracker T54–T58, `supabase/migrations/20261013090400_stories_reports.sql`.

- **Block user** (Apple guideline 1.2) — **not built**. No `blocks` table
  exists yet; needs one (a later migration) plus enforcement everywhere a
  blocked person's posts/comments/stories could otherwise surface.
- **Report content** (Apple 1.2, "with a timely response") — the `reports`
  table exists today (targets: review, comment, story, profile; reporter
  can only insert their own report; one report per reporter per target) —
  but there's no screen to file a report yet, and no process for a "timely
  response" on the other end.
- **Objectionable-word filter** (Apple 1.2) — not built; needs to run on
  review notes, Log a Visit's text-post content, and comments.
- **In-app account deletion** (Apple 5.1.1(v)) — not built. Needs a
  server-side Edge Function (service role) that deletes the user's posts and
  data, queues their files for cleanup via the `storage_cleanup_queue` table
  (which already exists, from `20261013090500_media.sql` — a trigger queues
  a row on `media` delete; nothing processes the queue yet, that's the
  separate Photo Cleanup Edge Function, T20), and revokes any Sign in with
  Apple tokens.
- **Visible support contact** — not built; needs a row in Settings → About
  plus a line on the App Store listing itself.
- Demo data caveat that applies across all of the above: the six
  `@platr.dev` accounts and their content are fake test data, and the
  dietary tags on the six real Jakarta restaurants (Halal, Vegetarian,
  Gluten-free) are **invented demo claims about real businesses** — all of
  it needs to be removed or hidden before any real tester sees the app (see
  `AGENTS.md` → Demo data, and tracker T23).
