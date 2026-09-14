-- Platr — dev seed
--
-- Real restaurants, real auth users (with a known dev password), follows,
-- logs, reviews, tags, likes, and comments — so every screen has something
-- genuine to display instead of src/lib/placeholder.ts fixtures.
--
-- Auth users are inserted directly into auth.users (pgcrypto for the bcrypt
-- hash, standard Supabase seeding pattern) rather than through the sign-up
-- API, so this can run as a plain migration. The on_auth_user_created trigger
-- fires normally and creates each profile + status_list_privacy rows.
--
-- Dev login for every seeded user: password "platr-dev-2026"
--   jordan@platr.dev   (Jordan Reeves — the "main" demo account)
--   aisha@platr.dev, ravi@platr.dev, sofia@platr.dev, leo@platr.dev, mei@platr.dev
--
-- Safe to run once on a fresh project; not written to be re-run (dev seed).

do $$
declare
  v_password text := crypt('platr-dev-2026', gen_salt('bf'));

  -- restaurants
  r_osteria uuid;
  r_maebird uuid;
  r_kato uuid;
  r_ilis uuid;
  r_deptculture uuid;
  r_bakmiekaret uuid;

  -- users (profiles.id = auth.users.id)
  u_jordan uuid;
  u_aisha uuid;
  u_ravi uuid;
  u_sofia uuid;
  u_leo uuid;
  u_mei uuid;

  -- logs
  l_jordan_osteria uuid;
  l_jordan_kato uuid;
  l_jordan_maebird uuid;
  l_jordan_deptculture uuid;
  l_jordan_ilis uuid;
  l_jordan_bakmiekaret uuid;
  l_aisha_osteria uuid;
  l_aisha_maebird uuid;
  l_aisha_ilis uuid;
  l_ravi_kato uuid;
  l_ravi_bakmiekaret uuid;
  l_ravi_osteria uuid;
  l_sofia_deptculture uuid;
  l_sofia_ilis uuid;
  l_leo_maebird uuid;
  l_leo_osteria uuid;
  l_mei_bakmiekaret uuid;
  l_mei_kato uuid;

  -- reviews (only the ones referenced later, for tags/likes/comments)
  rv_jordan_osteria uuid;
  rv_aisha_osteria uuid;
  rv_ravi_kato uuid;
  rv_sofia_deptculture uuid;
  rv_ravi_bakmiekaret uuid;
begin

  -- ---------------------------------------------------------------------
  -- restaurants
  -- ---------------------------------------------------------------------
  insert into restaurants (name, cuisine, price_level, area, city, address, lat, lng, about, website_url)
  values ('Osteria Fiorella', 'Italian', 2, 'SCBD', 'Jakarta', 'Jl. Jend. Sudirman Kav. 52-53, SCBD, Jakarta Selatan',
          -6.2251, 106.8090,
          'A neighbourhood Italian osteria known for hand-rolled pastas and a tight, seasonal menu. Intimate space — book ahead.',
          'https://example.com/osteria-fiorella')
  returning id into r_osteria;

  insert into restaurants (name, cuisine, price_level, area, city, address, lat, lng, about, website_url)
  values ('Mae Bird', 'Southern', 1, 'Kemang', 'Jakarta', 'Jl. Kemang Raya No. 8, Kemang, Jakarta Selatan',
          -6.2607, 106.8133,
          'Fried chicken, cornbread, and sweet tea in a room that feels like a Sunday porch. Casual, loud, worth the wait.',
          'https://example.com/mae-bird')
  returning id into r_maebird;

  insert into restaurants (name, cuisine, price_level, area, city, address, lat, lng, about, website_url)
  values ('Kato', 'Taiwanese', 2, 'Menteng', 'Jakarta', 'Jl. HOS Cokroaminoto No. 15, Menteng, Jakarta Pusat',
          -6.1957, 106.8347,
          'Hand-pulled noodles and a natural wine list in a room the size of a living room. Come early or wait at the bar.',
          'https://example.com/kato')
  returning id into r_kato;

  insert into restaurants (name, cuisine, price_level, area, city, address, lat, lng, about, website_url)
  values ('Ilis', 'New Nordic', 4, 'Sudirman', 'Jakarta', 'Jl. Jend. Sudirman Kav. 25, Jakarta Selatan',
          -6.2088, 106.8228,
          'A tasting-menu-only room built around foraged and fermented local ingredients. Book the counter seats if you can.',
          'https://example.com/ilis')
  returning id into r_ilis;

  insert into restaurants (name, cuisine, price_level, area, city, address, lat, lng, about, website_url)
  values ('Dept of Culture', 'Nigerian', 3, 'Cikini', 'Jakarta', 'Jl. Cikini Raya No. 40, Jakarta Pusat',
          -6.1889, 106.8388,
          'West African plates built for sharing — the jollof rice flight and suya are the ones people come back for.',
          'https://example.com/dept-of-culture')
  returning id into r_deptculture;

  insert into restaurants (name, cuisine, price_level, area, city, address, lat, lng, about, website_url)
  values ('Bakmie Karet', 'Indonesian', 1, 'Senen', 'Jakarta', 'Jl. Karet No. 12, Senen, Jakarta Pusat',
          -6.1751, 106.8420,
          'A no-frills bakmi counter that runs until 2am. Order it "special" and add the pangsit.',
          null)
  returning id into r_bakmiekaret;

  -- ---------------------------------------------------------------------
  -- auth users — triggers on_auth_user_created → profiles + status_list_privacy
  -- ---------------------------------------------------------------------
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  ) values
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
     'jordan@platr.dev', v_password, now(), now(),
     '{"provider":"email","providers":["email"]}',
     '{"username":"jordanreeves","display_name":"Jordan Reeves"}', now(), now(), '', '', '', '')
  returning id into u_jordan;

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  ) values
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
     'aisha@platr.dev', v_password, now(), now(),
     '{"provider":"email","providers":["email"]}',
     '{"username":"aishak","display_name":"Aisha Kurnia"}', now(), now(), '', '', '', '')
  returning id into u_aisha;

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  ) values
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
     'ravi@platr.dev', v_password, now(), now(),
     '{"provider":"email","providers":["email"]}',
     '{"username":"ravim","display_name":"Ravi Mehta"}', now(), now(), '', '', '', '')
  returning id into u_ravi;

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  ) values
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
     'sofia@platr.dev', v_password, now(), now(),
     '{"provider":"email","providers":["email"]}',
     '{"username":"sofiaa","display_name":"Sofia Alvarez"}', now(), now(), '', '', '', '')
  returning id into u_sofia;

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  ) values
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
     'leo@platr.dev', v_password, now(), now(),
     '{"provider":"email","providers":["email"]}',
     '{"username":"leot","display_name":"Leo Tanaka"}', now(), now(), '', '', '', '')
  returning id into u_leo;

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  ) values
    ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
     'mei@platr.dev', v_password, now(), now(),
     '{"provider":"email","providers":["email"]}',
     '{"username":"meiw","display_name":"Mei Wong"}', now(), now(), '', '', '', '')
  returning id into u_mei;

  -- fill in area/city (the trigger only sets display_name/username)
  update profiles set area = 'SCBD', city = 'Jakarta' where id = u_jordan;
  update profiles set area = 'Kemang', city = 'Jakarta' where id = u_aisha;
  update profiles set area = 'Menteng', city = 'Jakarta' where id = u_ravi;
  update profiles set area = 'Sudirman', city = 'Jakarta' where id = u_sofia;
  update profiles set area = 'Cikini', city = 'Jakarta' where id = u_leo;
  update profiles set area = 'Senen', city = 'Jakarta' where id = u_mei;

  -- everyone's Go-To / Visited sections public by default (Wishlist / Blacklisted stay private)
  update status_list_privacy set is_public = true
  where status in ('go_to', 'visited')
    and user_id in (u_jordan, u_aisha, u_ravi, u_sofia, u_leo, u_mei);

  -- ---------------------------------------------------------------------
  -- follows — Jordan follows everyone; Aisha & Ravi follow back; a little
  -- friend-to-friend so "mutual friends" has something to show
  -- ---------------------------------------------------------------------
  insert into follows (follower_id, following_id) values
    (u_jordan, u_aisha), (u_jordan, u_ravi), (u_jordan, u_sofia), (u_jordan, u_leo), (u_jordan, u_mei),
    (u_aisha, u_jordan), (u_ravi, u_jordan),
    (u_aisha, u_ravi), (u_aisha, u_sofia), (u_ravi, u_aisha), (u_sofia, u_aisha);

  -- ---------------------------------------------------------------------
  -- logs (one per user+restaurant) + reviews (one visit each here)
  -- ---------------------------------------------------------------------

  -- Jordan
  insert into logs (user_id, restaurant_id, status) values (u_jordan, r_osteria, 'go_to') returning id into l_jordan_osteria;
  insert into reviews (log_id, food_rating, vibe_rating, notes, visited_on)
    values (l_jordan_osteria, 9.0, 8.5, 'Hand-rolled cavatelli with lamb ragù — best in the city. Order the focaccia.', current_date)
    returning id into rv_jordan_osteria;

  insert into logs (user_id, restaurant_id, status) values (u_jordan, r_kato, 'go_to') returning id into l_jordan_kato;
  insert into reviews (log_id, food_rating, vibe_rating, notes, visited_on)
    values (l_jordan_kato, 8.5, 7.5, 'Never disappoints. The dan dan noodles are unreal.', current_date - 1);

  insert into logs (user_id, restaurant_id, status) values (u_jordan, r_maebird, 'visited') returning id into l_jordan_maebird;
  insert into reviews (log_id, food_rating, vibe_rating, notes, visited_on)
    values (l_jordan_maebird, 8.0, 7.0, 'Fried chicken sando was the move. Good for a quick lunch.', current_date - 10);

  insert into logs (user_id, restaurant_id, status) values (u_jordan, r_deptculture, 'visited') returning id into l_jordan_deptculture;
  insert into reviews (log_id, food_rating, vibe_rating, notes, visited_on)
    values (l_jordan_deptculture, 9.0, 8.5, 'Jollof rice flight is worth the trip alone.', current_date - 2);

  insert into logs (user_id, restaurant_id, status) values (u_jordan, r_ilis, 'wishlist') returning id into l_jordan_ilis;
  insert into logs (user_id, restaurant_id, status) values (u_jordan, r_bakmiekaret, 'wishlist') returning id into l_jordan_bakmiekaret;

  -- Aisha
  insert into logs (user_id, restaurant_id, status) values (u_aisha, r_osteria, 'visited') returning id into l_aisha_osteria;
  insert into reviews (log_id, food_rating, vibe_rating, notes, visited_on)
    values (l_aisha_osteria, 9.0, 8.5, 'Burrata was creamy, pasta a touch under-seasoned but generous portions.', current_date - 2)
    returning id into rv_aisha_osteria;

  insert into logs (user_id, restaurant_id, status) values (u_aisha, r_maebird, 'go_to') returning id into l_aisha_maebird;
  insert into reviews (log_id, food_rating, vibe_rating, notes, visited_on)
    values (l_aisha_maebird, 8.5, 8.0, 'My go-to Sunday spot. Cornbread alone is worth it.', current_date - 8);

  insert into logs (user_id, restaurant_id, status) values (u_aisha, r_ilis, 'visited') returning id into l_aisha_ilis;
  insert into reviews (log_id, food_rating, vibe_rating, notes, visited_on)
    values (l_aisha_ilis, 8.5, 9.5, 'Splurged for an anniversary dinner. Every course was a surprise.', current_date - 20);

  -- Ravi
  insert into logs (user_id, restaurant_id, status) values (u_ravi, r_kato, 'go_to') returning id into l_ravi_kato;
  insert into reviews (log_id, food_rating, vibe_rating, notes, visited_on)
    values (l_ravi_kato, 10.0, 7.0, 'Come for the noodles, stay for the natural wine list.', current_date - 4)
    returning id into rv_ravi_kato;

  insert into logs (user_id, restaurant_id, status) values (u_ravi, r_bakmiekaret, 'visited') returning id into l_ravi_bakmiekaret;
  insert into reviews (log_id, food_rating, vibe_rating, notes, visited_on)
    values (l_ravi_bakmiekaret, 7.5, 8.0, 'Unpretentious, generous portions — this one surprised me.', current_date - 5)
    returning id into rv_ravi_bakmiekaret;

  insert into logs (user_id, restaurant_id, status) values (u_ravi, r_osteria, 'visited') returning id into l_ravi_osteria;
  insert into reviews (log_id, food_rating, vibe_rating, notes, visited_on)
    values (l_ravi_osteria, 9.0, 8.0, 'Solo dinner at the bar. Chef chatted between courses.', current_date - 15);

  -- Sofia
  insert into logs (user_id, restaurant_id, status) values (u_sofia, r_deptculture, 'visited') returning id into l_sofia_deptculture;
  insert into reviews (log_id, food_rating, vibe_rating, notes, visited_on)
    values (l_sofia_deptculture, 9.5, 9.0, 'Brought visiting family — they still talk about the suya.', current_date - 7)
    returning id into rv_sofia_deptculture;

  insert into logs (user_id, restaurant_id, status) values (u_sofia, r_ilis, 'go_to') returning id into l_sofia_ilis;
  insert into reviews (log_id, food_rating, vibe_rating, notes, visited_on)
    values (l_sofia_ilis, 9.0, 9.5, 'Tasting menu is a full evening. Book the counter seats.', current_date - 12);

  -- Leo
  insert into logs (user_id, restaurant_id, status) values (u_leo, r_maebird, 'visited') returning id into l_leo_maebird;
  insert into reviews (log_id, food_rating, vibe_rating, notes, visited_on)
    values (l_leo_maebird, 8.0, 6.5, 'Solid comfort food, a little loud on a Friday night.', current_date - 9);

  insert into logs (user_id, restaurant_id, status) values (u_leo, r_osteria, 'visited') returning id into l_leo_osteria;
  insert into reviews (log_id, food_rating, vibe_rating, notes, visited_on)
    values (l_leo_osteria, 9.0, 8.0, 'First date. We stayed until they turned the lights up.', current_date - 18);

  -- Mei
  insert into logs (user_id, restaurant_id, status) values (u_mei, r_bakmiekaret, 'visited') returning id into l_mei_bakmiekaret;
  insert into reviews (log_id, food_rating, vibe_rating, notes, visited_on)
    values (l_mei_bakmiekaret, 8.0, 7.5, 'Late-night bakmi run. Never lets me down.', current_date - 2);

  insert into logs (user_id, restaurant_id, status) values (u_mei, r_kato, 'visited') returning id into l_mei_kato;
  insert into reviews (log_id, food_rating, vibe_rating, notes, visited_on)
    values (l_mei_kato, 8.5, 7.0, 'Team lunch that ran three hours. Nobody wanted to leave.', current_date - 14);

  -- ---------------------------------------------------------------------
  -- review_tags — a few per review, driving restaurant_tags_view
  -- ---------------------------------------------------------------------
  insert into review_tags (review_id, tag_id)
  select rv_jordan_osteria, id from tags where slug in ('italian', 'pasta', 'cozy', 'date-spot')
  union all
  select rv_aisha_osteria, id from tags where slug in ('italian', 'wood-fired', 'intimate')
  union all
  select rv_ravi_kato, id from tags where slug in ('taiwanese', 'adventurous', 'mid-range')
  union all
  select rv_sofia_deptculture, id from tags where slug in ('nigerian', 'group-hangout', 'celebration')
  union all
  select rv_ravi_bakmiekaret, id from tags where slug in ('indonesian', 'casual', 'budget', 'quick-bite');

  -- ---------------------------------------------------------------------
  -- likes + comments — a few, so Social/Post view show real counts
  -- ---------------------------------------------------------------------
  insert into likes (review_id, user_id) values
    (rv_aisha_osteria, u_jordan), (rv_aisha_osteria, u_ravi), (rv_aisha_osteria, u_leo),
    (rv_ravi_kato, u_jordan), (rv_ravi_kato, u_mei),
    (rv_sofia_deptculture, u_jordan), (rv_sofia_deptculture, u_aisha);

  insert into comments (review_id, user_id, body) values
    (rv_aisha_osteria, u_ravi, 'Adding this to my list!'),
    (rv_aisha_osteria, u_jordan, 'The focaccia really is that good.'),
    (rv_sofia_deptculture, u_leo, 'Been meaning to try this one.');

end $$;
