-- Platr — retire review_photos (staged; see README.md).
--
-- Run only after the app uses `media` everywhere. Copies any rows written since
-- the media migration ran, then drops the old table.

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
where not exists (
  select 1 from media m
  where m.review_id = rp.review_id and m.storage_path = rp.storage_path
)
on conflict do nothing;

drop table review_photos;
