-- Platr — sign-up support, settings, user search, areas.
--
-- * username_available(): live availability check for Sign Up. Usernames are
--   already unique and case-insensitive (citext) with a format check.
-- * user_settings: private, one row per user — terms acceptance, the 5
--   notification types, display prefs, default visibility for new lists.
--   Kept off `profiles` because profiles are world-readable.
-- * search_profiles(): Find Friends — suggested users when the query is empty,
--   name/@username search otherwise, with mutual-friend and log counts.
-- * city_areas: neighborhoods per city for Find for Me "Which area?" and
--   Decide Together. `restaurants.area` is the neighborhood column.
--
-- Signing in with a username is NOT here: no function ever returns an email to
-- the client. That ships later as a rate-limited Edge Function using the
-- service role; email-only sign-in comes first.

-- ---------------------------------------------------------------------------
-- username_available
-- ---------------------------------------------------------------------------
create or replace function username_available(_username text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select _username ~ '^[a-zA-Z0-9_]{2,30}$'
     and not exists (
       select 1 from profiles
       where username = _username::citext
         and id is distinct from auth.uid()
     );
$$;

grant execute on function username_available(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- user_settings
-- ---------------------------------------------------------------------------
create table user_settings (
  user_id                 uuid primary key references profiles (id) on delete cascade,
  terms_accepted_at       timestamptz,
  notify_friend_activity  boolean not null default true,
  notify_new_followers    boolean not null default true,
  notify_likes_comments   boolean not null default true,
  notify_streak_reminders boolean not null default false,
  notify_weekly_digest    boolean not null default false,
  theme                   text not null default 'light'  check (theme in ('light', 'dark', 'system')),
  text_size               text not null default 'medium' check (text_size in ('small', 'medium', 'large')),
  distance_unit           text not null default 'km'     check (distance_unit in ('km', 'mi')),
  default_list_visibility list_visibility not null default 'private',
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

comment on column user_settings.theme is
  'Only light is implemented; dark/system are stored but the buttons stay dead for now.';

create trigger user_settings_set_updated_at
  before update on user_settings
  for each row execute function set_updated_at();

alter table user_settings enable row level security;

create policy user_settings_select on user_settings for select using (user_id = auth.uid());
create policy user_settings_insert on user_settings for insert with check (user_id = auth.uid());
create policy user_settings_update on user_settings for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- A settings row for every profile, new and existing.
create or replace function seed_user_settings()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_settings (user_id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

create trigger profiles_seed_user_settings
  after insert on profiles
  for each row execute function seed_user_settings();

insert into user_settings (user_id)
select id from profiles
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- search_profiles
-- ---------------------------------------------------------------------------
create or replace function search_profiles(_query text default null, _limit integer default 20)
returns table (
  id           uuid,
  display_name text,
  username     citext,
  avatar_url   text,
  area         text,
  city         text,
  mutual_count integer,
  log_count    integer,
  is_following boolean
)
language sql
stable
security definer
set search_path = public
as $$
  with q as (
    select nullif(trim(coalesce(_query, '')), '') as term
  ),
  candidates as (
    select p.*
    from profiles p, q
    where p.id is distinct from auth.uid()
      and (
        q.term is null
        or p.display_name ilike '%' || replace(replace(replace(ltrim(q.term, '@'), '\', '\\'), '%', '\%'), '_', '\_') || '%'
        or p.username::text ilike '%' || replace(replace(replace(ltrim(q.term, '@'), '\', '\\'), '%', '\%'), '_', '\_') || '%'
      )
  )
  select
    c.id, c.display_name, c.username, c.avatar_url, c.area, c.city,
    (select count(*)::int
       from follows mine
       join follows theirs on theirs.following_id = mine.following_id
      where mine.follower_id = auth.uid() and theirs.follower_id = c.id) as mutual_count,
    (select count(*)::int
       from logs l
      where l.user_id = c.id
        and l.status in ('visited', 'go_to')
        and is_status_public(l.user_id, l.status)) as log_count,
    exists (select 1 from follows f where f.follower_id = auth.uid() and f.following_id = c.id) as is_following
  from candidates c
  order by mutual_count desc, log_count desc, c.display_name
  limit least(greatest(coalesce(_limit, 20), 1), 50);
$$;

grant execute on function search_profiles(text, integer) to authenticated;

-- ---------------------------------------------------------------------------
-- city_areas
-- ---------------------------------------------------------------------------
comment on column restaurants.area is
  'Neighborhood (e.g. SCBD, Kemang). Used for Find for Me "Which area?" and Decide Together.';

create view city_areas as
select city, area, count(*)::int as restaurant_count
from restaurants
where city is not null and area is not null
group by city, area;
