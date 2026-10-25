-- Platr — Log a Visit fields + the fixed tag vocabulary.
--
-- reviews: service_rating (the third score, next to Food and Vibe),
-- spice_level (4 steps, never part of any score) and share_to_story
-- (Log a Visit toggle, default on). Food, Vibe and Service are required on
-- every rated visit (Visited, Go-To, Blacklisted). tags: is_active / sort_order so the picker
-- shows exactly the Figma list while retired tags keep their history on old
-- visits. Max 5 tags per visit is enforced here too, not just in the app.

-- ---------------------------------------------------------------------------
-- reviews
-- ---------------------------------------------------------------------------
create type spice_level as enum ('mild', 'sedang', 'pedas', 'extra_pedas');

alter table reviews
  add column service_rating numeric(3, 1)
    check (service_rating >= 0 and service_rating <= 10 and (service_rating * 2) = floor(service_rating * 2)),
  add column spice_level    spice_level,
  add column share_to_story boolean not null default true;

comment on column reviews.food_rating is 'Food: the food itself. 0-10 in 0.5 steps.';
comment on column reviews.vibe_rating is 'Vibe: atmosphere and concept (noise level, music, decor). 0-10 in 0.5 steps.';
comment on column reviews.service_rating is
  'Service: staff and speed. 0-10 in 0.5 steps. Null on visits logged before Service existed; those count toward Food and Vibe only.';

comment on column reviews.spice_level is
  'Mild / Sedang / Pedas / Extra Pedas. Display only — never feeds any score.';
comment on column reviews.share_to_story is
  'Log a Visit "Share to story" toggle. Only Visited / Go-To visits ever become a story.';

-- Visited / Go-To / Blacklisted visits need all three scores. Checked when a
-- visit is saved or its scores are edited, so older visits without Service
-- stay valid until someone edits their scores.
create or replace function enforce_review_ratings()
returns trigger
language plpgsql
as $$
begin
  if exists (select 1 from logs l
             where l.id = new.log_id and l.status in ('visited', 'go_to', 'blacklisted'))
     and (new.food_rating is null or new.vibe_rating is null or new.service_rating is null)
  then
    raise exception 'Food, Vibe and Service are required for a visited place'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger reviews_require_ratings
  before insert or update of food_rating, vibe_rating, service_rating on reviews
  for each row execute function enforce_review_ratings();

-- ---------------------------------------------------------------------------
-- tags — picker visibility + ordering
-- ---------------------------------------------------------------------------
alter table tags
  add column is_active  boolean  not null default true,
  add column sort_order smallint not null default 100;

comment on column tags.is_active is
  'false = retired from the Log a Visit picker; still shown on visits that already use it.';

-- New tags from the Figma picker (80:80013).
insert into tags (category, label, slug) values
  ('cuisine',      'Asian',                'asian'),
  ('occasion',     'Quick Lunch',          'quick-lunch'),
  ('occasion',     'Group-Friendly',       'group-friendly'),
  ('occasion',     'Romantic',             'romantic'),
  ('vibe',         'Late Night',           'late-night'),
  ('vibe',         'Outdoor',              'outdoor'),
  ('vibe',         'Hidden Gem',           'hidden-gem'),
  ('vibe',         'Lively',               'lively'),
  ('vibe',         'Chill',                'chill'),
  ('local_flavor', 'Worth Queueing For',   'worth-queueing-for'),
  ('local_flavor', 'Warteg Energy',        'warteg-energy'),
  ('local_flavor', 'Portion King',         'portion-king'),
  ('local_flavor', 'Rainy Day Comfort',    'rainy-day-comfort'),
  ('local_flavor', 'Late Night Cravings',  'late-night-cravings'),
  ('local_flavor', 'Family-Style Sharing', 'family-style-sharing')
on conflict (category, slug) do update set is_active = true;

-- Labels aligned to the frame's casing / wording (slugs unchanged).
update tags set label = 'Date Spot'      where category = 'occasion' and slug = 'date-spot';
update tags set label = 'Business Lunch' where category = 'occasion' and slug = 'business-lunch';
update tags set label = 'Vegetarian'     where category = 'dietary'  and slug = 'vegetarian-options';
update tags set label = 'Vegan'          where category = 'dietary'  and slug = 'vegan-options';
update tags set label = 'Gluten-free'    where category = 'dietary'  and slug = 'gluten-free-available';

-- Retired from the picker (not in the Figma list; kept for existing visits).
-- Celebration stays active: Find for Me's "Celebration" occasion maps to it.
update tags set is_active = false
where (category, slug) in (
  ('cuisine',  'pasta'),
  ('cuisine',  'wood-fired'),
  ('occasion', 'anniversary'),
  ('occasion', 'group-hangout'),
  ('occasion', 'quick-bite'),
  ('vibe',     'dim-lighting'),
  ('vibe',     'intimate'),
  ('vibe',     'adventurous'),
  ('vibe',     'familiar'),
  ('vibe',     'fancy'),
  ('vibe',     'casual')
);

-- Picker order: the Figma order first; any other active tag (e.g. cuisines
-- added for real restaurants) follows alphabetically at the default 100.
update tags t set sort_order = v.sort_order
from (values
  ('cuisine',      'italian',              1),
  ('cuisine',      'asian',                2),
  ('cuisine',      'southern',             3),
  ('cuisine',      'nigerian',             4),
  ('cuisine',      'indonesian',           5),
  ('cuisine',      'japanese',             6),
  ('occasion',     'date-spot',            1),
  ('occasion',     'quick-lunch',          2),
  ('occasion',     'group-friendly',       3),
  ('occasion',     'business-lunch',       4),
  ('occasion',     'romantic',             5),
  ('occasion',     'solo',                 6),
  ('occasion',     'celebration',          7),
  ('vibe',         'cozy',                 1),
  ('vibe',         'late-night',           2),
  ('vibe',         'outdoor',              3),
  ('vibe',         'hidden-gem',           4),
  ('vibe',         'lively',               5),
  ('vibe',         'chill',                6),
  ('price_point',  'budget',               1),
  ('price_point',  'mid-range',            2),
  ('price_point',  'splurge',              3),
  ('dietary',      'vegetarian-options',   1),
  ('dietary',      'vegan-options',        2),
  ('dietary',      'gluten-free-available',3),
  ('dietary',      'halal',                4),
  ('local_flavor', 'worth-queueing-for',   1),
  ('local_flavor', 'warteg-energy',        2),
  ('local_flavor', 'portion-king',         3),
  ('local_flavor', 'rainy-day-comfort',    4),
  ('local_flavor', 'late-night-cravings',  5),
  ('local_flavor', 'family-style-sharing', 6)
) as v(category, slug, sort_order)
where t.category = v.category::tag_category and t.slug = v.slug;

-- ---------------------------------------------------------------------------
-- Find for Me occasions -> the tags that count as a match for them.
-- Read-only reference data for the app (and a server-side matcher later).
-- ---------------------------------------------------------------------------
create table find_occasion_tags (
  occasion   text     not null,  -- 'casual_meal', 'date_night', ...
  label      text     not null,  -- as shown in Find for Me Question 1
  sort_order smallint not null,
  tag_id     uuid     not null references tags (id) on delete cascade,
  primary key (occasion, tag_id)
);

alter table find_occasion_tags enable row level security;
create policy find_occasion_tags_read on find_occasion_tags for select using (true);

insert into find_occasion_tags (occasion, label, sort_order, tag_id)
select v.occasion, v.label, v.sort_order, t.id
from (values
  ('casual_meal',    'Casual meal',    1, 'vibe',     'chill'),
  ('date_night',     'Date night',     2, 'occasion', 'date-spot'),
  ('date_night',     'Date night',     2, 'occasion', 'romantic'),
  ('quick_bite',     'Quick bite',     3, 'occasion', 'quick-lunch'),
  ('celebration',    'Celebration',    4, 'occasion', 'celebration'),
  ('business_lunch', 'Business lunch', 5, 'occasion', 'business-lunch'),
  ('catch_up',       'Catch-up',       6, 'occasion', 'group-friendly'),
  ('catch_up',       'Catch-up',       6, 'vibe',     'chill')
) as v(occasion, label, sort_order, category, slug)
join tags t on t.category = v.category::tag_category and t.slug = v.slug;

-- ---------------------------------------------------------------------------
-- Max 5 tags per visit (across all categories).
-- A row-level BEFORE trigger sees rows inserted earlier in the same statement,
-- so a single multi-row insert of 6 tags is rejected too.
-- ---------------------------------------------------------------------------
create or replace function enforce_max_review_tags()
returns trigger
language plpgsql
as $$
begin
  if (select count(*) from review_tags where review_id = new.review_id) >= 5 then
    raise exception 'A visit can have at most 5 tags'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger review_tags_max_five
  before insert on review_tags
  for each row execute function enforce_max_review_tags();
