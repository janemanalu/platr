-- Platr — stories (+ views, likes) and reports.
--
-- Two kinds of story under one bubble:
--   * logged   — one per Visited / Go-To visit saved with "Share to story" on.
--                References the review; the app shows its cover photo (or the
--                note as a text slide when there's no photo).
--   * freeform — photo + optional caption + optional place tag. Never creates
--                a post, never touches scores.
-- Both are followers-only and expire 24h after posting. Expired stories are
-- hidden by the visibility check immediately; a cleanup job deletes them later.

create type story_kind as enum ('logged', 'freeform');

create table stories (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles (id) on delete cascade,
  kind          story_kind not null,
  review_id     uuid unique references reviews (id) on delete cascade,
  restaurant_id uuid references restaurants (id) on delete set null,
  caption       text check (char_length(caption) <= 280),
  created_at    timestamptz not null default now(),
  expires_at    timestamptz not null default (now() + interval '24 hours'),
  constraint stories_kind_shape check (
    (kind = 'logged'   and review_id is not null and caption is null) or
    (kind = 'freeform' and review_id is null)
  )
);
create index stories_user_expires_idx on stories (user_id, expires_at desc);
create index stories_expires_idx on stories (expires_at);

-- Visible to the owner and their followers, only while unexpired. A logged
-- story also requires its post to be visible (so it disappears with the post).
create or replace function story_is_visible(_story_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from stories s
    where s.id = _story_id
      and s.expires_at > now()
      and (
        s.user_id = auth.uid()
        or (
          exists (select 1 from follows f
                  where f.follower_id = auth.uid() and f.following_id = s.user_id)
          and (s.kind = 'freeform' or review_is_visible(s.review_id))
        )
      )
  );
$$;

alter table stories enable row level security;

create policy stories_select on stories for select using (story_is_visible(id));
-- Clients only create freeform stories; logged ones come from the trigger below.
create policy stories_insert on stories for insert
  with check (user_id = auth.uid() and kind = 'freeform');
create policy stories_delete on stories for delete using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Logged stories, created/removed alongside the visit.
-- ---------------------------------------------------------------------------
create or replace function sync_logged_story()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Turned off (by editing the post): remove its logged story.
  if tg_op = 'UPDATE' and old.share_to_story and not new.share_to_story then
    delete from stories where review_id = new.id;
    return new;
  end if;

  -- Saved with the toggle on, or turned back on while the post is under 24h old.
  -- The story keeps the post's own 24h window.
  if new.share_to_story
     and (tg_op = 'INSERT' or not old.share_to_story)
     and new.created_at > now() - interval '24 hours'
     and exists (select 1 from logs l where l.id = new.log_id and l.status in ('visited', 'go_to'))
  then
    insert into stories (user_id, kind, review_id, restaurant_id, created_at, expires_at)
    values (new.user_id, 'logged', new.id, new.restaurant_id,
            new.created_at, new.created_at + interval '24 hours')
    on conflict (review_id) do nothing;
  end if;
  return new;
end;
$$;

create trigger reviews_sync_logged_story
  after insert or update of share_to_story on reviews
  for each row execute function sync_logged_story();

-- ---------------------------------------------------------------------------
-- story_views — powers the coral (unseen) vs grey (seen) ring.
-- Viewers see their own rows; the story's owner sees who viewed it.
-- ---------------------------------------------------------------------------
create table story_views (
  story_id  uuid not null references stories (id) on delete cascade,
  viewer_id uuid not null references profiles (id) on delete cascade,
  viewed_at timestamptz not null default now(),
  primary key (story_id, viewer_id)
);
create index story_views_viewer_idx on story_views (viewer_id);

alter table story_views enable row level security;

create policy story_views_select on story_views for select
  using (
    viewer_id = auth.uid()
    or exists (select 1 from stories s where s.id = story_views.story_id and s.user_id = auth.uid())
  );
create policy story_views_insert on story_views for insert
  with check (viewer_id = auth.uid() and story_is_visible(story_id));

-- ---------------------------------------------------------------------------
-- story_likes — the ♡ in the Story Viewer.
-- ---------------------------------------------------------------------------
create table story_likes (
  story_id   uuid not null references stories (id) on delete cascade,
  user_id    uuid not null references profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (story_id, user_id)
);

alter table story_likes enable row level security;

create policy story_likes_select on story_likes for select
  using (
    user_id = auth.uid()
    or exists (select 1 from stories s where s.id = story_likes.story_id and s.user_id = auth.uid())
  );
create policy story_likes_insert on story_likes for insert
  with check (user_id = auth.uid() and story_is_visible(story_id));
create policy story_likes_delete on story_likes for delete using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- reports — the "Report" option on posts, comments, stories and profiles.
-- Insert-only from the app; nobody can read them back through the API.
-- ---------------------------------------------------------------------------
create type report_target as enum ('review', 'comment', 'story', 'profile');

create table reports (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references profiles (id) on delete cascade,
  target_type report_target not null,
  target_id   uuid not null,
  reason      text not null check (char_length(reason) between 1 and 1000),
  created_at  timestamptz not null default now(),
  unique (reporter_id, target_type, target_id)
);

alter table reports enable row level security;

create policy reports_insert on reports for insert with check (reporter_id = auth.uid());
