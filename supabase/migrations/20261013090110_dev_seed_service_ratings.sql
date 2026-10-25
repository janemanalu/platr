-- Platr — DEV DATA: Service scores for the seeded demo reviews.
--
-- Only touches reviews by the six seeded @platr.dev accounts. Real users'
-- older reviews keep service_rating null (they count toward Food and Vibe
-- only). Values sit near each review's own Food/Vibe average with a fixed
-- per-review offset between -1.5 and +1.0, so the demo looks realistic and
-- reruns give the same numbers.

update reviews r
set service_rating = greatest(0, least(10,
      round(((r.food_rating + r.vibe_rating) / 2
             + ((abs(hashtext(r.id::text)) % 6) * 0.5 - 1.5)) * 2) / 2))
from logs l, auth.users u
where l.id = r.log_id
  and u.id = r.user_id
  and u.email like '%@platr.dev'
  and l.status in ('visited', 'go_to', 'blacklisted')
  and r.food_rating is not null
  and r.vibe_rating is not null
  and r.service_rating is null;
