-- Platr — notifications inbox + push tokens.
--
-- Notifications store a type, an actor and ids — never free text. The app
-- renders the message from the type, so a notification can never reveal what's
-- on anyone's wishlist (e.g. a decision invite says "Aisha invited you", not
-- what's in it).
--
-- Rows are created by triggers / server functions only; clients can read their
-- own, mark them read, and delete them.

create type notification_type as enum (
  'new_follower',
  'like',
  'comment',
  'decision_invite',
  'decision_results',
  'decision_closed',
  'friend_activity',
  'streak_reminder',
  'weekly_digest'
);

create table notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles (id) on delete cascade,
  actor_id    uuid references profiles (id) on delete set null,
  type        notification_type not null,
  review_id   uuid references reviews (id) on delete cascade,
  decision_id uuid, -- FK added with the Decide Together tables
  created_at  timestamptz not null default now(),
  read_at     timestamptz
);
create index notifications_user_created_idx on notifications (user_id, created_at desc);
create index notifications_user_unread_idx on notifications (user_id) where read_at is null;

alter table notifications enable row level security;

create policy notifications_select on notifications for select using (user_id = auth.uid());
create policy notifications_update on notifications for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy notifications_delete on notifications for delete using (user_id = auth.uid());

-- The only thing a client may change is read_at.
revoke update on notifications from anon, authenticated;
grant update (read_at) on notifications to authenticated;

-- ---------------------------------------------------------------------------
-- Triggers: follows, likes, comments
-- ---------------------------------------------------------------------------
create or replace function notify_new_follower()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into notifications (user_id, actor_id, type)
  values (new.following_id, new.follower_id, 'new_follower');
  return new;
end;
$$;

create trigger follows_notify
  after insert on follows
  for each row execute function notify_new_follower();

create or replace function notify_review_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  _owner uuid;
begin
  select user_id into _owner from reviews where id = new.review_id;
  if _owner is not null and _owner <> new.user_id then
    insert into notifications (user_id, actor_id, type, review_id)
    values (_owner, new.user_id, (case when tg_table_name = 'likes' then 'like' else 'comment' end)::notification_type, new.review_id);
  end if;
  return new;
end;
$$;

create trigger likes_notify
  after insert on likes
  for each row execute function notify_review_activity();

create trigger comments_notify
  after insert on comments
  for each row execute function notify_review_activity();

-- ---------------------------------------------------------------------------
-- push_tokens — one row per device; registered after the push permission prompt.
-- ---------------------------------------------------------------------------
create table push_tokens (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles (id) on delete cascade,
  token        text not null unique,
  platform     text not null check (platform in ('ios', 'android')),
  created_at   timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);
create index push_tokens_user_idx on push_tokens (user_id);

alter table push_tokens enable row level security;

create policy push_tokens_own on push_tokens for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
