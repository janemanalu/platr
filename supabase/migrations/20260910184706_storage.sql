-- Platr — Storage buckets
--
-- Two public-read buckets. Writes are restricted to files under a folder named
-- after the uploader's user id, e.g.  review-photos/<uid>/<review_id>/<file>.

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true),
       ('review-photos', 'review-photos', true)
on conflict (id) do nothing;

-- Anyone can read (buckets are public, but be explicit for the API).
create policy "avatars are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "review photos are publicly readable"
  on storage.objects for select
  using (bucket_id = 'review-photos');

-- Authenticated users write only within their own <uid>/ prefix.
create policy "users manage their own avatar"
  on storage.objects for all
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "users manage their own review photos"
  on storage.objects for all
  using (
    bucket_id = 'review-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'review-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
