# Platr — schema (v2, APPLIED 2026-09-10)

> Migrations `20260910184702`–`20260910184708` applied to project
> `fpcpmoczjocscmckrjzh`. This doc is the design rationale; the SQL files under
> `migrations/` are the source of truth. Resolved open questions: single `notes`
> field · one `log` per user+restaurant with many `reviews` · "friends" = anyone
> you follow · likes/comments tables created now (UI later) · `restaurant_tags`
> auto-derived from reviews via `restaurant_tags_view` (no table) · email+password
> auth · public-read storage buckets.


Derived from Figma nodes: Home (13:9), Discovery list (13:2142), Find for Me
(13:2611), Restaurant Detail (13:7914), Log a Visit (13:2948), Profile (13:5811),
Create a List (13:6892), Social Feed (13:4270/4824), User Profile (13:5378),
List Detail (13:8356).

**v2 changes from your answers:**
- Single `notes` field (not Food/Vibe/Tales split).
- **`logs` = one row per user+restaurant** (the relationship + status).
  **`reviews` = many per log** — each visit adds a review with its own ratings,
  notes, photos, tagged friends, tags.
- "Friends" = anyone you follow (no mutual requirement). "Mutual friends" is a
  derived label only.
- `likes` + `comments` tables included now (on reviews); UI later.

Nothing migrated yet. Confirm and I'll write `0001_init.sql`.

---

## Enums

| enum | values |
|---|---|
| `log_status` | `visited`, `wishlist`, `blacklisted`, `go_to` |
| `tag_category` | `cuisine`, `occasion`, `vibe`, `price_point`, `dietary` |
| `list_visibility` | `public`, `private` |

`price_level smallint` (1–4 → `$`–`$$$$`) on restaurants.

---

## Tables

### `profiles`   (id = auth.users.id)
| column | type | notes |
|---|---|---|
| `id` | uuid PK → auth.users | |
| `display_name` | text not null | "Jordan Reeves" |
| `username` | citext unique not null | "@jordanreeves" (stored without `@`) |
| `avatar_url` | text null | |
| `area` | text null | "SCBD" |
| `city` | text null | "Jakarta" |
| `bio` | text null | keeping it, nullable |
| `created_at` | timestamptz default now() | |

### `restaurants`
| column | type | notes |
|---|---|---|
| `id` | uuid PK | |
| `google_place_id` | text unique null | filled once Places lands |
| `name` | text not null | |
| `cuisine` | text null | primary label ("Italian", "Southern") |
| `price_level` | smallint null | CHECK 1–4 |
| `area` | text null | "Kemang" |
| `city` | text null | "Jakarta" |
| `address` | text null | |
| `lat` / `lng` | double precision null | map pins |
| `about` | text null | description |
| `website_url` | text null | |
| `cover_photo_url` | text null | |
| `created_by` | uuid null → profiles | |
| `created_at` | timestamptz default now() | |

### `tags`   (controlled vocab — "fixed list, no custom tags")
| column | type | notes |
|---|---|---|
| `id` | uuid PK | |
| `category` | tag_category not null | |
| `label` | text not null | "Wood-fired" |
| `slug` | text not null | |
| unique | (category, slug) | |

### `restaurant_tags`   (M:N)
`restaurant_id` → restaurants · `tag_id` → tags · PK(both).
*(Populated by aggregating `review_tags` up, or curated — see open Q2.)*

### `logs`   — one per user+restaurant
| column | type | notes |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid not null → profiles | |
| `restaurant_id` | uuid not null → restaurants | |
| `status` | log_status not null | Visited / Wishlist / Blacklisted / Go-To |
| `created_at` | timestamptz default now() | |
| `updated_at` | timestamptz default now() | |
| **unique** | **(user_id, restaurant_id)** | status changes in place |

### `reviews`   — many per log (one per visit)
| column | type | notes |
|---|---|---|
| `id` | uuid PK | |
| `log_id` | uuid not null → logs (cascade) | |
| `user_id` | uuid not null → profiles | denormalized from log, for RLS |
| `restaurant_id` | uuid not null → restaurants | denormalized from log |
| `food_rating` | numeric(3,1) null | 0–10, CHECK 0.5 steps |
| `vibe_rating` | numeric(3,1) null | 0–10, CHECK 0.5 steps |
| `notes` | text null | "What stood out? The story…" |
| `visited_on` | date null | optional; else `created_at` |
| `created_at` | timestamptz default now() | |
| `updated_at` | timestamptz default now() | |

A `wishlist` / `blacklisted` log can have zero reviews.

### `review_photos`
`id` PK · `review_id` → reviews (cascade) · `storage_path` text (bucket
`review-photos`) · `position` smallint default 0.

### `review_tags`   (M:N)
`review_id` → reviews (cascade) · `tag_id` → tags · PK(both).

### `review_friend_tags`   ("Tag friends")
`review_id` → reviews (cascade) · `friend_id` → profiles · PK(both).

### `review_suggestions`   — anonymous, insert-only
"Sent anonymously — never shown publicly."
| column | type | notes |
|---|---|---|
| `id` | uuid PK | |
| `restaurant_id` | uuid not null → restaurants | |
| `author_id` | uuid not null → profiles | moderation only, never exposed |
| `review_id` | uuid null → reviews (set null) | |
| `body` | text not null | |
| `created_at` | timestamptz default now() | |

RLS: insert by author; **no select** through anon/auth API.

### `custom_lists`
`id` PK · `owner_id` → profiles · `name` text · `visibility` list_visibility
default `private` · `created_at`.

### `list_items`
`list_id` → custom_lists (cascade) · `restaurant_id` → restaurants · `position`
smallint · `added_at` · PK(list_id, restaurant_id).

### `status_list_privacy`   — per-status Public/Private toggle on Profile
`user_id` → profiles · `status` log_status · `is_public` boolean default false ·
PK(user_id, status).

### `follows`
`follower_id` → profiles · `following_id` → profiles · `created_at` ·
PK(follower_id, following_id) · CHECK follower ≠ following.
"Friends" = your following list. "N mutual friends" = follows in both directions.

### `likes`   (on a review)
`id` PK · `review_id` → reviews (cascade) · `user_id` → profiles · `created_at` ·
unique(review_id, user_id).

### `comments`   (on a review)
`id` PK · `review_id` → reviews (cascade) · `user_id` → profiles · `body` text ·
`created_at`.

---

## Derived / not stored

- **Streak** ("5 day streak") — SQL function over distinct review dates of the
  user's reviews. No column.
- **Restaurant scores** — view `restaurant_scores(restaurant_id, food_avg,
  vibe_avg, overall_avg, review_count)`, `overall_avg = avg((food+vibe)/2)`.
  Social Feed keeps showing F and V separately from the raw review.
- **Tastes Like You / Trending Near You** — queries over reviews + tags + follows.

---

## RLS (high level)

- `profiles`, `restaurants`, `tags`, `restaurant_tags`, `follows` — public read;
  writes by the owner (restaurants: any authenticated user may insert / set
  `google_place_id`).
- `logs` + `reviews` — readable if you're the owner **OR** the owner's
  `status_list_privacy` for that log's status `is_public`.
- `review_photos`, `review_tags`, `review_friend_tags`, `likes`, `comments` —
  readable iff the parent review is readable; users write their own rows.
- `custom_lists` / `list_items` — readable if `visibility='public'` or owner.
- `review_suggestions` — insert only, never selectable.

---

## Seed: tag vocabulary  (from Restaurant Detail + Find for Me)

- **cuisine:** Italian, Pasta, Wood-fired  *(grows as restaurants are added)*
- **occasion:** Date spot, Anniversary, Business lunch, Solo, Group Hangout,
  Quick Bite, Celebration
- **vibe:** Cozy, Dim lighting, Intimate, Adventurous, Familiar, Fancy, Casual
- **price_point:** Mid-range
- **dietary:** Vegetarian options, Gluten-free available

Plus a `0003_dev_seed.sql` with a handful of restaurants/users/reviews for
building screens against (the names already in the wireframe: Osteria Fiorella,
Mae Bird, Kato, Ilis, Dept of Culture, Bakmie Karet).

---

## Remaining open questions

1. **`restaurant_tags`** — curate manually, or auto-derive from the union of
   `review_tags` for that restaurant? (Restaurant Detail says tag pills are
   "display only" / aggregated.)
2. **Auth** — email/password, magic link, or an OAuth provider (Google/Apple)?
   Affects the `profiles` insert trigger and the onboarding screen (not in Figma).
3. **Storage buckets** — `avatars` (public) + `review-photos` (public read).
   OK to make review photos publicly readable, or gate them behind the same
   review RLS via signed URLs?
