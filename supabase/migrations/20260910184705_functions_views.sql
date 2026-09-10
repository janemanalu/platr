-- Platr — derived data: aggregate scores, restaurant tag rollup, streak, mutuals.
--
-- These views run with definer rights (not security_invoker), so the aggregates
-- span every review — a restaurant's score is a global stat, like a star rating,
-- not "reviews you can see".

-- ---------------------------------------------------------------------------
-- restaurant_scores — food / vibe / overall averages + review count
-- ---------------------------------------------------------------------------
create view restaurant_scores as
select
  r.id as restaurant_id,
  count(rv.id) filter (where rv.food_rating is not null or rv.vibe_rating is not null) as review_count,
  round(avg(rv.food_rating), 1) as food_avg,
  round(avg(rv.vibe_rating), 1) as vibe_avg,
  round(
    avg((rv.food_rating + rv.vibe_rating) / 2.0)
      filter (where rv.food_rating is not null and rv.vibe_rating is not null),
    1
  ) as overall_avg
from restaurants r
left join reviews rv on rv.restaurant_id = r.id
group by r.id;

-- ---------------------------------------------------------------------------
-- restaurant_tags_view — a restaurant's tags = the union of what reviewers chose,
-- with a use count for ranking the pills
-- ---------------------------------------------------------------------------
create view restaurant_tags_view as
select
  rv.restaurant_id,
  rt.tag_id,
  t.category,
  t.label,
  t.slug,
  count(*) as uses
from review_tags rt
join reviews rv on rv.id = rt.review_id
join tags t on t.id = rt.tag_id
group by rv.restaurant_id, rt.tag_id, t.category, t.label, t.slug;

-- ---------------------------------------------------------------------------
-- current_streak(user) — consecutive days, ending today or yesterday, that have
-- at least one review. Gaps-and-islands over distinct review dates.
-- ---------------------------------------------------------------------------
create or replace function current_streak(_user_id uuid)
returns integer
language sql
stable
as $$
  with days as (
    select distinct coalesce(visited_on, (created_at)::date) as d
    from reviews
    where user_id = _user_id
  ),
  ranked as (
    select d, (d - (row_number() over (order by d))::int) as grp
    from days
  ),
  streaks as (
    select grp, count(*) as len, max(d) as last_day
    from ranked
    group by grp
  )
  select coalesce(
    (select len from streaks
     where last_day >= current_date - 1
     order by last_day desc
     limit 1),
    0
  );
$$;

-- ---------------------------------------------------------------------------
-- mutual_follows(target) — profiles that both the caller and `target` follow.
-- Powers "N mutual friends · Ravi, Sofia" on another user's profile.
-- ---------------------------------------------------------------------------
create or replace function mutual_follows(_target uuid)
returns setof profiles
language sql
stable
as $$
  select p.*
  from profiles p
  where p.id in (select following_id from follows where follower_id = auth.uid())
    and p.id in (select following_id from follows where follower_id = _target);
$$;
