-- Platr — Row Level Security
--
-- Visibility rule for a user's food activity: a log (and its reviews + their
-- children) is readable if you own it, OR the owner has flipped that status
-- section to public on their Profile.

-- ---------------------------------------------------------------------------
-- helper: is a given user's status section public?
-- SECURITY DEFINER so it can read status_list_privacy regardless of the caller.
-- ---------------------------------------------------------------------------
create or replace function is_status_public(_user_id uuid, _status log_status)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select is_public from status_list_privacy
     where user_id = _user_id and status = _status),
    false
  );
$$;

create or replace function review_is_visible(_review_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from reviews r
    join logs l on l.id = r.log_id
    where r.id = _review_id
      and (l.user_id = auth.uid() or is_status_public(l.user_id, l.status))
  );
$$;

-- ---------------------------------------------------------------------------
alter table profiles              enable row level security;
alter table restaurants           enable row level security;
alter table tags                  enable row level security;
alter table logs                  enable row level security;
alter table reviews               enable row level security;
alter table review_photos         enable row level security;
alter table review_tags           enable row level security;
alter table review_friend_tags    enable row level security;
alter table review_suggestions    enable row level security;
alter table custom_lists          enable row level security;
alter table list_items            enable row level security;
alter table status_list_privacy   enable row level security;
alter table follows               enable row level security;
alter table likes                 enable row level security;
alter table comments              enable row level security;

-- ---------------------------------------------------------------------------
-- profiles — world-readable; you manage your own row
-- ---------------------------------------------------------------------------
create policy profiles_select on profiles for select using (true);
create policy profiles_insert on profiles for insert with check (id = auth.uid());
create policy profiles_update on profiles for update using (id = auth.uid()) with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- restaurants — world-readable communal catalog; any signed-in user can add or
-- enrich a row
-- ---------------------------------------------------------------------------
create policy restaurants_select on restaurants for select using (true);
create policy restaurants_insert on restaurants for insert
  with check (auth.uid() is not null and (created_by is null or created_by = auth.uid()));
create policy restaurants_update on restaurants for update
  using (auth.uid() is not null) with check (auth.uid() is not null);

-- ---------------------------------------------------------------------------
-- tags — read-only reference data (seeded by migration / service role)
-- ---------------------------------------------------------------------------
create policy tags_select on tags for select using (true);

-- ---------------------------------------------------------------------------
-- logs
-- ---------------------------------------------------------------------------
create policy logs_select on logs for select
  using (user_id = auth.uid() or is_status_public(user_id, status));
create policy logs_insert on logs for insert with check (user_id = auth.uid());
create policy logs_update on logs for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy logs_delete on logs for delete using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- reviews
-- ---------------------------------------------------------------------------
create policy reviews_select on reviews for select
  using (
    user_id = auth.uid()
    or exists (
      select 1 from logs l
      where l.id = reviews.log_id and is_status_public(l.user_id, l.status)
    )
  );
create policy reviews_insert on reviews for insert
  with check (exists (select 1 from logs l where l.id = log_id and l.user_id = auth.uid()));
create policy reviews_update on reviews for update
  using (exists (select 1 from logs l where l.id = reviews.log_id and l.user_id = auth.uid()))
  with check (exists (select 1 from logs l where l.id = log_id and l.user_id = auth.uid()));
create policy reviews_delete on reviews for delete
  using (exists (select 1 from logs l where l.id = reviews.log_id and l.user_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- review children — read if the parent review is visible, write if you own it
-- ---------------------------------------------------------------------------
create policy review_photos_select on review_photos for select using (review_is_visible(review_id));
create policy review_photos_write on review_photos for all
  using (exists (select 1 from reviews r where r.id = review_photos.review_id and r.user_id = auth.uid()))
  with check (exists (select 1 from reviews r where r.id = review_id and r.user_id = auth.uid()));

create policy review_tags_select on review_tags for select using (review_is_visible(review_id));
create policy review_tags_write on review_tags for all
  using (exists (select 1 from reviews r where r.id = review_tags.review_id and r.user_id = auth.uid()))
  with check (exists (select 1 from reviews r where r.id = review_id and r.user_id = auth.uid()));

create policy review_friend_tags_select on review_friend_tags for select using (review_is_visible(review_id));
create policy review_friend_tags_write on review_friend_tags for all
  using (exists (select 1 from reviews r where r.id = review_friend_tags.review_id and r.user_id = auth.uid()))
  with check (exists (select 1 from reviews r where r.id = review_id and r.user_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- review_suggestions — insert only, forever. No select / update / delete policy,
-- so the anon & authenticated roles can never read these back.
-- ---------------------------------------------------------------------------
create policy review_suggestions_insert on review_suggestions for insert
  with check (author_id = auth.uid());

-- ---------------------------------------------------------------------------
-- custom lists
-- ---------------------------------------------------------------------------
create policy custom_lists_select on custom_lists for select
  using (visibility = 'public' or owner_id = auth.uid());
create policy custom_lists_insert on custom_lists for insert with check (owner_id = auth.uid());
create policy custom_lists_update on custom_lists for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy custom_lists_delete on custom_lists for delete using (owner_id = auth.uid());

create policy list_items_select on list_items for select
  using (exists (
    select 1 from custom_lists cl
    where cl.id = list_items.list_id and (cl.visibility = 'public' or cl.owner_id = auth.uid())
  ));
create policy list_items_write on list_items for all
  using (exists (select 1 from custom_lists cl where cl.id = list_items.list_id and cl.owner_id = auth.uid()))
  with check (exists (select 1 from custom_lists cl where cl.id = list_id and cl.owner_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- status_list_privacy — booleans are world-readable (the client needs to know
-- which sections of a profile to show); only you change your own
-- ---------------------------------------------------------------------------
create policy status_list_privacy_select on status_list_privacy for select using (true);
create policy status_list_privacy_update on status_list_privacy for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy status_list_privacy_insert on status_list_privacy for insert with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- follows — world-readable graph; you manage your own outgoing edges
-- ---------------------------------------------------------------------------
create policy follows_select on follows for select using (true);
create policy follows_insert on follows for insert with check (follower_id = auth.uid());
create policy follows_delete on follows for delete using (follower_id = auth.uid());

-- ---------------------------------------------------------------------------
-- likes / comments — visible with the review; you own your rows
-- ---------------------------------------------------------------------------
create policy likes_select on likes for select using (review_is_visible(review_id));
create policy likes_insert on likes for insert
  with check (user_id = auth.uid() and review_is_visible(review_id));
create policy likes_delete on likes for delete using (user_id = auth.uid());

create policy comments_select on comments for select using (review_is_visible(review_id));
create policy comments_insert on comments for insert
  with check (user_id = auth.uid() and review_is_visible(review_id));
create policy comments_update on comments for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy comments_delete on comments for delete using (user_id = auth.uid());
