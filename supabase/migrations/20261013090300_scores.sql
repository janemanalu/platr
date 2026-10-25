-- Platr — the Platr score.
--
-- Rules:
--   * Only restaurants have a Platr score. One vote per person: their most
--     recent visit with ratings (Visited, Go-To or Blacklisted — never Wishlist).
--   * Three components: Food (the food), Vibe (atmosphere and concept),
--     Service (staff and speed). Each is averaged separately, then shrunk
--     toward a prior:
--       shrunk = (n * avg + PRIOR_WEIGHT * PRIOR_MEAN) / (n + PRIOR_WEIGHT)
--     A visit with no Service rating (logged before Service existed) counts
--     toward Food and Vibe only.
--   * Platr = FOOD_WEIGHT * food + SERVICE_WEIGHT * service + VIBE_WEIGHT * vibe,
--     shown only once MIN_RATINGS people have rated; below that the app shows
--     "New · N ratings".
--   * Spice Level never feeds any score.
--   * Friends' score is a separate function, never blended in.
--
-- The constants are named functions so they're tunable in one place.
-- PRIOR_MEAN is a fixed 7.0 for now; switch to a platform-wide average later.

-- ---------------------------------------------------------------------------
-- Named constants
-- ---------------------------------------------------------------------------
create or replace function score_prior_mean()     returns numeric language sql immutable as $$ select 7.0::numeric  $$;
create or replace function score_prior_weight()   returns numeric language sql immutable as $$ select 5::numeric    $$;
create or replace function score_food_weight()    returns numeric language sql immutable as $$ select 0.50::numeric $$;
create or replace function score_service_weight() returns numeric language sql immutable as $$ select 0.25::numeric $$;
create or replace function score_vibe_weight()    returns numeric language sql immutable as $$ select 0.25::numeric $$;
create or replace function score_min_ratings()    returns integer language sql immutable as $$ select 3 $$;

-- ---------------------------------------------------------------------------
-- restaurant_scores
--
-- Columns: rating_count (people), food_raw / vibe_raw / service_raw (plain
-- averages), food_score / vibe_score / service_score (shrunk), platr_score.
-- Kept for the current app until it's updated: review_count (= rating_count),
-- food_avg / vibe_avg (= raw averages), overall_avg (= platr_score).
--
-- Runs with definer rights (like before) so the score covers every vote,
-- including private sections and Blacklisted visits — anonymously. Only
-- aggregates come out, and no number at all below MIN_RATINGS people: with
-- one or two raters an "average" would reveal someone's private rating.
-- Below that the view returns rating_count only ("New · N ratings").
-- ---------------------------------------------------------------------------
drop view if exists restaurant_scores;

create view restaurant_scores as
with latest as (
  select distinct on (rv.user_id, rv.restaurant_id)
    rv.restaurant_id,
    rv.user_id,
    rv.food_rating,
    rv.vibe_rating,
    rv.service_rating
  from reviews rv
  join logs l on l.id = rv.log_id
  where l.status in ('visited', 'go_to', 'blacklisted')
    and (rv.food_rating is not null or rv.vibe_rating is not null or rv.service_rating is not null)
  order by rv.user_id, rv.restaurant_id,
           coalesce(rv.visited_on, rv.created_at::date) desc, rv.created_at desc
),
agg as (
  select
    restaurant_id,
    count(*)              as rating_count,
    count(food_rating)    as food_n,
    avg(food_rating)      as food_raw,
    count(vibe_rating)    as vibe_n,
    avg(vibe_rating)      as vibe_raw,
    count(service_rating) as service_n,
    avg(service_rating)   as service_raw
  from latest
  group by restaurant_id
),
shrunk as (
  select
    r.id as restaurant_id,
    coalesce(a.rating_count, 0) as rating_count,
    a.food_raw,
    a.vibe_raw,
    a.service_raw,
    (coalesce(a.food_n, 0) * coalesce(a.food_raw, 0) + score_prior_weight() * score_prior_mean())
      / (coalesce(a.food_n, 0) + score_prior_weight()) as food_score,
    (coalesce(a.vibe_n, 0) * coalesce(a.vibe_raw, 0) + score_prior_weight() * score_prior_mean())
      / (coalesce(a.vibe_n, 0) + score_prior_weight()) as vibe_score,
    (coalesce(a.service_n, 0) * coalesce(a.service_raw, 0) + score_prior_weight() * score_prior_mean())
      / (coalesce(a.service_n, 0) + score_prior_weight()) as service_score
  from restaurants r
  left join agg a on a.restaurant_id = r.id
),
gated as (
  select *,
    rating_count >= score_min_ratings() as enough,
    score_food_weight() * food_score
      + score_service_weight() * service_score
      + score_vibe_weight() * vibe_score as platr
  from shrunk
)
select
  restaurant_id,
  rating_count::int                               as rating_count,
  case when enough then round(food_raw, 1)    end as food_raw,
  case when enough then round(vibe_raw, 1)    end as vibe_raw,
  case when enough then round(service_raw, 1) end as service_raw,
  case when enough then round(food_score, 1)    end as food_score,
  case when enough then round(vibe_score, 1)    end as vibe_score,
  case when enough then round(service_score, 1) end as service_score,
  case when enough then round(platr, 1)         end as platr_score,
  -- compatibility with the current app
  rating_count::bigint                            as review_count,
  case when enough then round(food_raw, 1) end    as food_avg,
  case when enough then round(vibe_raw, 1) end    as vibe_avg,
  case when enough then round(platr, 1)    end    as overall_avg
from gated;

-- ---------------------------------------------------------------------------
-- friends_score(restaurant) — the separate "Friends: F 9.0 · V 8.5 · S 8.0" line.
-- People the caller follows, latest visit each, plain averages (no shrinkage).
-- Only visits the caller could see anyway count: Visited / Go-To in a public
-- section. Blacklisted visits never count here, since their ratings are
-- always private to the owner.
-- ---------------------------------------------------------------------------
create or replace function friends_score(_restaurant_id uuid)
returns table (
  friend_count  integer,
  food_avg      numeric,
  vibe_avg      numeric,
  service_avg   numeric,
  friend_names  text[]
)
language sql
stable
security definer
set search_path = public
as $$
  with latest as (
    select distinct on (rv.user_id)
      rv.user_id, rv.food_rating, rv.vibe_rating, rv.service_rating,
      coalesce(rv.visited_on, rv.created_at::date) as visited
    from reviews rv
    join logs l on l.id = rv.log_id
    where rv.restaurant_id = _restaurant_id
      and l.status in ('visited', 'go_to')
      and is_status_public(l.user_id, l.status)
      and (rv.food_rating is not null or rv.vibe_rating is not null or rv.service_rating is not null)
      and rv.user_id in (select following_id from follows where follower_id = auth.uid())
    order by rv.user_id, coalesce(rv.visited_on, rv.created_at::date) desc, rv.created_at desc
  )
  select
    count(*)::int,
    round(avg(latest.food_rating), 1),
    round(avg(latest.vibe_rating), 1),
    round(avg(latest.service_rating), 1),
    (array_agg(p.display_name order by latest.visited desc))[1:3]
  from latest
  join profiles p on p.id = latest.user_id;
$$;
