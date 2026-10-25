-- Platr — one media table for posts and stories.
--
-- Each row belongs to exactly one of: a post (review_id) or a story (story_id).
-- Up to 6 per post (position 0-5, unique per parent; position 0 = cover).
-- width/height drive the carousel ratio (clamped 4:5 to 16:9 in the app).
-- media_type is 'image' only for now; video adds an enum value later and uses
-- duration_ms + thumbnail_url, which are already here (nullable).
--
-- Storage:
--   * post photos stay in the public `review-photos` bucket: <uid>/<review_id>/<file>
--   * story photos go in a new PRIVATE `story-media` bucket: <uid>/<story_id>/<file>,
--     read through signed URLs, because freeform stories are followers-only.
--     For those rows `url` is null and the app signs `storage_path` instead.
--
-- review_photos is copied over here and dropped later (see
-- supabase/migrations_staged/), once the app reads from media.

create type media_type as enum ('image');

create table media (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references profiles (id) on delete cascade,
  review_id     uuid references reviews (id) on delete cascade,
  story_id      uuid references stories (id) on delete cascade,
  storage_path  text not null,
  url           text,
  width         integer check (width > 0),
  height        integer check (height > 0),
  position      smallint not null default 0 check (position between 0 and 5),
  media_type    media_type not null default 'image',
  duration_ms   integer check (duration_ms > 0),
  thumbnail_url text,
  created_at    timestamptz not null default now(),
  constraint media_one_parent check (num_nonnulls(review_id, story_id) = 1)
);

create unique index media_review_position_uq on media (review_id, position) where review_id is not null;
create unique index media_story_position_uq  on media (story_id, position)  where story_id is not null;
create index media_owner_idx on media (owner_id, created_at desc);

alter table media enable row level security;

create policy media_select on media for select
  using (
    (review_id is not null and review_is_visible(review_id))
    or (story_id is not null and story_is_visible(story_id))
  );

create policy media_insert on media for insert
  with check (
    owner_id = auth.uid()
    and (
      (review_id is not null and exists (select 1 from reviews r where r.id = review_id and r.user_id = auth.uid()))
      or (story_id is not null and exists (select 1 from stories s where s.id = story_id and s.user_id = auth.uid()))
    )
  );

-- Reorder / replace within your own post or story; can't be moved onto someone else's.
create policy media_update on media for update
  using (owner_id = auth.uid())
  with check (
    owner_id = auth.uid()
    and (
      (review_id is not null and exists (select 1 from reviews r where r.id = review_id and r.user_id = auth.uid()))
      or (story_id is not null and exists (select 1 from stories s where s.id = story_id and s.user_id = auth.uid()))
    )
  );

create policy media_delete on media for delete using (owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Copy existing review_photos (0 rows at time of writing). Their public URL is
-- built from this project's storage base. width/height are unknown for old
-- rows and stay null; the app falls back to 4:5 for those.
-- ---------------------------------------------------------------------------
insert into media (owner_id, review_id, storage_path, url, position, media_type)
select
  r.user_id,
  rp.review_id,
  rp.storage_path,
  'https://fpcpmoczjocscmckrjzh.supabase.co/storage/v1/object/public/review-photos/' || rp.storage_path,
  least(rp.position, 5),
  'image'
from review_photos rp
join reviews r on r.id = rp.review_id
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- story-media bucket (private)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('story-media', 'story-media', false)
on conflict (id) do nothing;

create policy "story media readable by story viewers"
  on storage.objects for select
  using (
    bucket_id = 'story-media'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or exists (
        select 1 from stories s
        where s.id::text = (storage.foldername(name))[2]
          and story_is_visible(s.id)
      )
    )
  );

create policy "users manage their own story media"
  on storage.objects for all
  using (
    bucket_id = 'story-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'story-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ---------------------------------------------------------------------------
-- Deleting a post (or story) deletes its files.
--
-- Supabase doesn't allow deleting storage objects from SQL, so:
--   1. the app removes a post's files through the Storage API, then deletes
--      the post (MediaUploader owns this path);
--   2. as a safety net, every media row that disappears — including cascades
--      from deleting a log, a story or a whole account — queues its file here,
--      and the `storage-cleanup` Edge Function (scheduled) removes whatever is
--      still in the bucket and clears the queue.
-- No client access: RLS on, no policies; only the service role reads it.
-- ---------------------------------------------------------------------------
create table storage_cleanup_queue (
  id           bigint generated always as identity primary key,
  bucket_id    text not null,
  storage_path text not null,
  queued_at    timestamptz not null default now()
);

alter table storage_cleanup_queue enable row level security;

create or replace function queue_media_file_cleanup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into storage_cleanup_queue (bucket_id, storage_path)
  values (case when old.story_id is not null then 'story-media' else 'review-photos' end,
          old.storage_path);
  return old;
end;
$$;

create trigger media_queue_file_cleanup
  after delete on media
  for each row execute function queue_media_file_cleanup();
