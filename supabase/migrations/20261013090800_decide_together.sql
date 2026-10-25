-- Platr — Decide Together.
--
-- A session: an organizer invites people; each participant submits dietary
-- needs and (with explicit per-session consent) the wishlist places they're
-- happy to share, unticking any they don't want to. Platr picks fill gaps.
-- Everyone votes; the organizer locks the pick.
--
-- Privacy:
--   * Everything here is visible only to that session's participants.
--   * Wishlists stay private (see is_status_public). The only path from a
--     wishlist into a session is a decision_candidates row the user inserts
--     themselves, after giving consent for that session.
--   * Nobody sees whose wishlist a place came from — not other participants,
--     not people who shared their own, not the decision card or notifications.
--     Each person sees only their own picks (my_decision_candidates) and can
--     untick them. Results carry counts only ("On 3 of 4 wishlists").
--   * A place on exactly one wishlist never appears in Results, for any group
--     size — otherwise, e.g. in a pair, it would be obviously the other
--     person's. Results = places on 2+ wishlists, plus Platr picks that are on
--     no wishlist. Clients can't read candidate rows at all (counting them
--     would reveal the same thing); everything goes through the functions.
--   * Votes on the final pick are visible to participants.
--   * Dietary needs never drop a place: anything not tagged for every need
--     goes in a "not confirmed" group that names the unconfirmed needs.
--
-- Lifecycle: sessions close 24h after creation (closes_at). An open session
-- past closes_at counts as closed immediately, by query. After closing, only
-- people who submitted count. The organizer can extend once by 24h (e.g. when
-- only they submitted) or fall back to Find for Me.

create type decision_status as enum ('open', 'voting', 'confirmed', 'closed');
create type decision_candidate_source as enum ('wishlist', 'platr_pick');

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table decision_sessions (
  id                      uuid primary key default gen_random_uuid(),
  organizer_id            uuid not null references profiles (id) on delete cascade,
  title                   text not null check (char_length(title) between 1 and 80),
  occasion                text,
  when_label              text,         -- "Tonight", "Saturday"
  scheduled_for           timestamptz,
  city                    text,
  area                    text,         -- restaurants.area, e.g. "Kemang"
  meeting_lat             double precision, -- the meeting area's centre, set by the app
  meeting_lng             double precision, -- (ranking uses distance from here)
  party_size              smallint check (party_size between 1 and 50),
  budget                  smallint check (budget between 1 and 4),
  status                  decision_status not null default 'open',
  closes_at               timestamptz not null default (now() + interval '24 hours'),
  extended                boolean not null default false,
  confirmed_restaurant_id uuid references restaurants (id) on delete set null,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);
create index decision_sessions_organizer_idx on decision_sessions (organizer_id, created_at desc);

create trigger decision_sessions_set_updated_at
  before update on decision_sessions
  for each row execute function set_updated_at();

create table decision_participants (
  session_id       uuid not null references decision_sessions (id) on delete cascade,
  user_id          uuid not null references profiles (id) on delete cascade,
  is_organizer     boolean not null default false,
  invited_at       timestamptz not null default now(),
  submitted_at     timestamptz,
  declined_at      timestamptz,
  dietary_needs    text[] not null default '{}', -- dietary tag slugs, e.g. {halal, vegan-options}
  wishlist_consent boolean not null default false,
  primary key (session_id, user_id)
);
create index decision_participants_user_idx on decision_participants (user_id);

create table decision_candidates (
  id             uuid primary key default gen_random_uuid(),
  session_id     uuid not null references decision_sessions (id) on delete cascade,
  restaurant_id  uuid not null references restaurants (id) on delete cascade,
  source         decision_candidate_source not null,
  contributed_by uuid references profiles (id) on delete cascade,
  created_at     timestamptz not null default now(),
  constraint decision_candidates_shape check (
    (source = 'wishlist'   and contributed_by is not null) or
    (source = 'platr_pick' and contributed_by is null)
  )
);
create unique index decision_candidates_uq
  on decision_candidates (session_id, restaurant_id, coalesce(contributed_by, '00000000-0000-0000-0000-000000000000'::uuid));

create table decision_votes (
  session_id    uuid not null,
  user_id       uuid not null,
  restaurant_id uuid not null references restaurants (id) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (session_id, user_id),
  foreign key (session_id, user_id) references decision_participants (session_id, user_id) on delete cascade
);

alter table notifications
  add constraint notifications_decision_fk
  foreign key (decision_id) references decision_sessions (id) on delete cascade;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function is_decision_participant(_session_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from decision_participants
    where session_id = _session_id and user_id = auth.uid() and declined_at is null
  );
$$;

create or replace function is_decision_organizer(_session_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from decision_sessions
    where id = _session_id and organizer_id = auth.uid()
  );
$$;

-- Status as the app should show it: an open/voting session past closes_at is closed.
create or replace function decision_effective_status(_session_id uuid)
returns decision_status
language sql
stable
security definer
set search_path = public
as $$
  select case
    when s.status in ('open', 'voting') and s.closes_at <= now() then 'closed'::decision_status
    else s.status
  end
  from decision_sessions s
  where s.id = _session_id and is_decision_participant(s.id);
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table decision_sessions     enable row level security;
alter table decision_participants enable row level security;
alter table decision_candidates   enable row level security;
alter table decision_votes        enable row level security;

-- sessions
create policy decision_sessions_select on decision_sessions for select
  using (organizer_id = auth.uid() or is_decision_participant(id));
create policy decision_sessions_insert on decision_sessions for insert
  with check (organizer_id = auth.uid());
create policy decision_sessions_update on decision_sessions for update
  using (organizer_id = auth.uid()) with check (organizer_id = auth.uid());
create policy decision_sessions_delete on decision_sessions for delete
  using (organizer_id = auth.uid());

-- participants: the organizer invites; each participant edits only their own row
create policy decision_participants_select on decision_participants for select
  using (is_decision_participant(session_id) or is_decision_organizer(session_id));
create policy decision_participants_insert on decision_participants for insert
  with check (
    is_decision_organizer(session_id)
    and (is_organizer = false or user_id = auth.uid())
  );
create policy decision_participants_update on decision_participants for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy decision_participants_delete on decision_participants for delete
  using (user_id = auth.uid() or is_decision_organizer(session_id));

-- Participants can only change their own answers, not their role.
revoke update on decision_participants from anon, authenticated;
grant update (submitted_at, declined_at, dietary_needs, wishlist_consent)
  on decision_participants to authenticated;

-- candidates: insert only (without RETURNING — clients have no SELECT).
create policy decision_candidates_insert on decision_candidates for insert
  with check (
    (
      -- a place from MY wishlist, after I consented for this session
      source = 'wishlist'
      and contributed_by = auth.uid()
      and exists (
        select 1 from decision_participants p
        where p.session_id = decision_candidates.session_id
          and p.user_id = auth.uid()
          and p.wishlist_consent
          and p.declined_at is null
      )
      and exists (
        select 1 from logs l
        where l.user_id = auth.uid()
          and l.restaurant_id = decision_candidates.restaurant_id
          and l.status = 'wishlist'
      )
    )
    or (
      -- a Platr pick filling a gap, added by the organizer's app
      source = 'platr_pick'
      and is_decision_organizer(session_id)
    )
  );

-- No direct reads, updates or deletes. Your own picks come from
-- my_decision_candidates(), removal from untick_decision_candidate(), and the
-- group's options from decision_results().
revoke select, update, delete on decision_candidates from anon, authenticated;

-- True if this place can appear in Results (and be voted for): on 2+
-- wishlists, or a Platr pick that is on no wishlist.
create or replace function decision_place_eligible(_session_id uuid, _restaurant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select count(*) filter (where source = 'wishlist') >= 2
        or (count(*) filter (where source = 'wishlist') = 0 and bool_or(source = 'platr_pick'))
    from decision_candidates
    where session_id = _session_id and restaurant_id = _restaurant_id
  ), false);
$$;

create or replace function my_decision_candidates(_session_id uuid)
returns setof uuid -- restaurant ids I added from my wishlist
language sql
stable
security definer
set search_path = public
as $$
  select restaurant_id
  from decision_candidates
  where session_id = _session_id
    and contributed_by = auth.uid()
    and source = 'wishlist';
$$;

-- Untick a place I added from my wishlist; the organizer can also remove a
-- Platr pick.
create or replace function untick_decision_candidate(_session_id uuid, _restaurant_id uuid)
returns void
language sql
volatile
security definer
set search_path = public
as $$
  delete from decision_candidates
  where session_id = _session_id
    and restaurant_id = _restaurant_id
    and (
      (source = 'wishlist' and contributed_by = auth.uid())
      or (source = 'platr_pick' and is_decision_organizer(_session_id))
    );
$$;

-- votes: one per participant, for a place that's in Results
create policy decision_votes_select on decision_votes for select
  using (is_decision_participant(session_id));
create policy decision_votes_insert on decision_votes for insert
  with check (
    user_id = auth.uid()
    and is_decision_participant(session_id)
    and decision_effective_status(session_id) = 'voting'
    and decision_place_eligible(session_id, restaurant_id)
  );
create policy decision_votes_update on decision_votes for update
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and decision_effective_status(session_id) = 'voting'
    and decision_place_eligible(session_id, restaurant_id)
  );
create policy decision_votes_delete on decision_votes for delete using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- distance_km — great-circle distance (haversine), for ranking by distance.
-- ---------------------------------------------------------------------------
create or replace function distance_km(_lat1 double precision, _lng1 double precision,
                                       _lat2 double precision, _lng2 double precision)
returns double precision
language sql
immutable
as $$
  select 2 * 6371 * asin(sqrt(
    power(sin(radians(_lat2 - _lat1) / 2), 2)
    + cos(radians(_lat1)) * cos(radians(_lat2)) * power(sin(radians(_lng2 - _lng1) / 2), 2)
  ));
$$;

-- ---------------------------------------------------------------------------
-- decision_results(session) — ranked candidates for Group Results.
--   * Only places on 2+ wishlists plus Platr picks on no wishlist; a place on
--     exactly one wishlist is never returned. If nothing overlaps, that leaves
--     just the Platr picks.
--   * Counts only, never who: wishlist_count of wishlist_total ("On 3 of 4
--     wishlists"). on_shared_wishlists marks the "On your wishlists" section.
--   * Dietary needs (of everyone who submitted) never exclude a place:
--       - tagged for every need     -> dietary_status 'confirmed', listed first
--       - missing any needed tag    -> 'not_confirmed', with unconfirmed_needs
--                                      naming them, e.g. {Halal}
--     With no needs, dietary_status is null and there is one group.
--   * Rank within a group: wishlist count, then distance from the meeting
--     area, then Platr score. Once voting starts, votes come first.
-- ---------------------------------------------------------------------------
create or replace function decision_results(_session_id uuid)
returns table (
  restaurant_id       uuid,
  votes               integer,
  wishlist_count      integer,
  wishlist_total      integer,
  on_shared_wishlists boolean,
  is_platr_pick       boolean,
  distance_km         double precision,
  dietary_status      text,
  unconfirmed_needs   text[],
  platr_score         numeric,
  food_score          numeric,
  vibe_score          numeric,
  service_score       numeric
)
language sql
stable
security definer
set search_path = public
as $$
  with sess as (
    select s.*, decision_effective_status(s.id) <> 'open' as voting_started
    from decision_sessions s
    where s.id = _session_id and is_decision_participant(s.id)
  ),
  needs as (
    select distinct n.slug, coalesce(t.label, n.slug) as label
    from decision_participants p
    cross join lateral unnest(p.dietary_needs) as n(slug)
    left join tags t on t.category = 'dietary' and t.slug = n.slug
    where p.session_id = _session_id
      and p.submitted_at is not null
      and p.declined_at is null
  ),
  total as (
    select count(*)::int as n
    from decision_participants p
    where p.session_id = _session_id and p.wishlist_consent and p.declined_at is null
  ),
  cands as (
    select c.restaurant_id,
           count(*) filter (where c.source = 'wishlist')::int as wishlist_count,
           bool_or(c.source = 'platr_pick')                    as is_platr_pick
    from decision_candidates c
    where c.session_id = _session_id
    group by c.restaurant_id
    having count(*) filter (where c.source = 'wishlist') >= 2
        or (count(*) filter (where c.source = 'wishlist') = 0 and bool_or(c.source = 'platr_pick'))
  ),
  diet as (
    select cands.*,
      (select array_agg(n.label order by n.label)
       from needs n
       where not exists (select 1 from restaurant_tags_view rt
                         where rt.restaurant_id = cands.restaurant_id
                           and rt.category = 'dietary'
                           and rt.slug = n.slug)) as unconfirmed_needs
    from cands
  ),
  ranked as (
  select
    d.restaurant_id,
    (select count(*)::int from decision_votes v
      where v.session_id = _session_id and v.restaurant_id = d.restaurant_id) as votes,
    d.wishlist_count,
    total.n                as wishlist_total,
    d.wishlist_count >= 2  as on_shared_wishlists,
    d.is_platr_pick,
    case when sess.meeting_lat is not null and r.lat is not null
         then round(distance_km(sess.meeting_lat, sess.meeting_lng, r.lat, r.lng)::numeric, 1)::double precision
    end as distance_km,
    case when not exists (select 1 from needs) then null
         when d.unconfirmed_needs is null then 'confirmed'
         else 'not_confirmed'
    end as dietary_status,
    d.unconfirmed_needs,
    sc.platr_score,
    sc.food_score,
    sc.vibe_score,
    sc.service_score,
    sess.voting_started
  from diet d
  cross join sess
  cross join total
  join restaurants r on r.id = d.restaurant_id
  left join restaurant_scores sc on sc.restaurant_id = d.restaurant_id
  )
  select restaurant_id, votes, wishlist_count, wishlist_total, on_shared_wishlists, is_platr_pick, distance_km,
         dietary_status, unconfirmed_needs, platr_score, food_score, vibe_score, service_score
  from ranked
  order by
    (dietary_status = 'not_confirmed') nulls first,          -- confirmed group first
    case when voting_started then votes end desc nulls last,
    wishlist_count desc,
    distance_km asc nulls last,
    platr_score desc nulls last;
$$;

-- ---------------------------------------------------------------------------
-- Invite notifications (no session content in the notification itself).
-- ---------------------------------------------------------------------------
create or replace function notify_decision_invite()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not new.is_organizer then
    insert into notifications (user_id, actor_id, type, decision_id)
    select new.user_id, s.organizer_id, 'decision_invite', s.id
    from decision_sessions s
    where s.id = new.session_id;
  end if;
  return new;
end;
$$;

create trigger decision_participants_notify
  after insert on decision_participants
  for each row execute function notify_decision_invite();
