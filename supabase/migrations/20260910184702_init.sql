-- Platr — initial schema
-- Tables, enums, indexes, updated_at triggers, and the auth → profiles bridge.
-- RLS is enabled in a later migration.

create extension if not exists citext;
create extension if not exists pgcrypto; -- gen_random_uuid()

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type log_status as enum ('visited', 'wishlist', 'blacklisted', 'go_to');
create type tag_category as enum ('cuisine', 'occasion', 'vibe', 'price_point', 'dietary');
create type list_visibility as enum ('public', 'private');

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles  (one row per auth user)
-- ---------------------------------------------------------------------------
create table profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  username     citext not null unique,
  avatar_url   text,
  area         text,
  city         text,
  bio          text,
  created_at   timestamptz not null default now(),
  constraint username_format check (username ~ '^[a-zA-Z0-9_]{2,30}$')
);

-- Create a profile row automatically when a new auth user is created.
-- display_name / username fall back to metadata supplied at sign-up.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    coalesce(
      new.raw_user_meta_data ->> 'username',
      regexp_replace(split_part(new.email, '@', 1), '[^a-zA-Z0-9_]', '', 'g')
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------------
-- restaurants  (shared catalog; filled from Google Places)
-- ---------------------------------------------------------------------------
create table restaurants (
  id              uuid primary key default gen_random_uuid(),
  google_place_id text unique,
  name            text not null,
  cuisine         text,
  price_level     smallint check (price_level between 1 and 4),
  area            text,
  city            text,
  address         text,
  lat             double precision,
  lng             double precision,
  about           text,
  website_url     text,
  cover_photo_url text,
  created_by      uuid references profiles (id) on delete set null,
  created_at      timestamptz not null default now()
);

create index restaurants_city_area_idx on restaurants (city, area);

-- ---------------------------------------------------------------------------
-- tags  (controlled vocabulary — no user-created tags)
-- ---------------------------------------------------------------------------
create table tags (
  id       uuid primary key default gen_random_uuid(),
  category tag_category not null,
  label    text not null,
  slug     text not null,
  unique (category, slug)
);

-- ---------------------------------------------------------------------------
-- logs  (one per user + restaurant — the relationship and its status)
-- ---------------------------------------------------------------------------
create table logs (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles (id) on delete cascade,
  restaurant_id uuid not null references restaurants (id) on delete cascade,
  status        log_status not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (user_id, restaurant_id)
);

create index logs_restaurant_idx on logs (restaurant_id);
create index logs_user_status_idx on logs (user_id, status);

create trigger logs_set_updated_at
  before update on logs
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- reviews  (many per log — one per visit)
-- ---------------------------------------------------------------------------
create table reviews (
  id            uuid primary key default gen_random_uuid(),
  log_id        uuid not null references logs (id) on delete cascade,
  user_id       uuid not null references profiles (id) on delete cascade,
  restaurant_id uuid not null references restaurants (id) on delete cascade,
  food_rating   numeric(3, 1) check (food_rating >= 0 and food_rating <= 10 and (food_rating * 2) = floor(food_rating * 2)),
  vibe_rating   numeric(3, 1) check (vibe_rating >= 0 and vibe_rating <= 10 and (vibe_rating * 2) = floor(vibe_rating * 2)),
  notes         text,
  visited_on    date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index reviews_log_idx on reviews (log_id);
create index reviews_restaurant_idx on reviews (restaurant_id);
create index reviews_user_created_idx on reviews (user_id, created_at desc);

create trigger reviews_set_updated_at
  before update on reviews
  for each row execute function set_updated_at();

-- Keep reviews.user_id / restaurant_id in step with the parent log.
create or replace function sync_review_from_log()
returns trigger
language plpgsql
as $$
begin
  select l.user_id, l.restaurant_id
    into new.user_id, new.restaurant_id
  from logs l
  where l.id = new.log_id;
  return new;
end;
$$;

create trigger reviews_sync_from_log
  before insert or update of log_id on reviews
  for each row execute function sync_review_from_log();

-- ---------------------------------------------------------------------------
-- review children
-- ---------------------------------------------------------------------------
create table review_photos (
  id           uuid primary key default gen_random_uuid(),
  review_id    uuid not null references reviews (id) on delete cascade,
  storage_path text not null,
  position     smallint not null default 0
);
create index review_photos_review_idx on review_photos (review_id);

create table review_tags (
  review_id uuid not null references reviews (id) on delete cascade,
  tag_id    uuid not null references tags (id) on delete cascade,
  primary key (review_id, tag_id)
);
create index review_tags_tag_idx on review_tags (tag_id);

create table review_friend_tags (
  review_id uuid not null references reviews (id) on delete cascade,
  friend_id uuid not null references profiles (id) on delete cascade,
  primary key (review_id, friend_id)
);
create index review_friend_tags_friend_idx on review_friend_tags (friend_id);

-- Anonymous suggestion/complaint to the restaurant. Insert-only; never selectable
-- through the client API (no select policy is ever added).
create table review_suggestions (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants (id) on delete cascade,
  author_id     uuid not null references profiles (id) on delete cascade,
  review_id     uuid references reviews (id) on delete set null,
  body          text not null,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- custom lists
-- ---------------------------------------------------------------------------
create table custom_lists (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references profiles (id) on delete cascade,
  name       text not null,
  visibility list_visibility not null default 'private',
  created_at timestamptz not null default now()
);
create index custom_lists_owner_idx on custom_lists (owner_id);

create table list_items (
  list_id       uuid not null references custom_lists (id) on delete cascade,
  restaurant_id uuid not null references restaurants (id) on delete cascade,
  position      smallint not null default 0,
  added_at      timestamptz not null default now(),
  primary key (list_id, restaurant_id)
);

-- ---------------------------------------------------------------------------
-- per-status Public/Private toggle on the Profile screen
-- ---------------------------------------------------------------------------
create table status_list_privacy (
  user_id   uuid not null references profiles (id) on delete cascade,
  status    log_status not null,
  is_public boolean not null default false,
  primary key (user_id, status)
);

-- Seed the four rows for each new profile (all private by default).
create or replace function seed_status_privacy()
returns trigger
language plpgsql
as $$
begin
  insert into public.status_list_privacy (user_id, status, is_public)
  values (new.id, 'visited', false),
         (new.id, 'wishlist', false),
         (new.id, 'blacklisted', false),
         (new.id, 'go_to', false);
  return new;
end;
$$;

create trigger profiles_seed_status_privacy
  after insert on profiles
  for each row execute function seed_status_privacy();

-- ---------------------------------------------------------------------------
-- follows  ("friends" = your following list)
-- ---------------------------------------------------------------------------
create table follows (
  follower_id  uuid not null references profiles (id) on delete cascade,
  following_id uuid not null references profiles (id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint no_self_follow check (follower_id <> following_id)
);
create index follows_following_idx on follows (following_id);

-- ---------------------------------------------------------------------------
-- likes / comments  (on a review — the unit shown in the Social Feed)
-- ---------------------------------------------------------------------------
create table likes (
  id         uuid primary key default gen_random_uuid(),
  review_id  uuid not null references reviews (id) on delete cascade,
  user_id    uuid not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (review_id, user_id)
);
create index likes_review_idx on likes (review_id);

create table comments (
  id         uuid primary key default gen_random_uuid(),
  review_id  uuid not null references reviews (id) on delete cascade,
  user_id    uuid not null references profiles (id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now()
);
create index comments_review_idx on comments (review_id, created_at);
