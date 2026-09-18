-- Platr — replace the dev seed's invented restaurants with real, verifiable
-- places (queried live from Google Places), and clean up two stray rows left
-- over from ad hoc Places testing earlier in development.
--
-- Same 6 users, same follow graph, same roughly-shaped log/review density —
-- only the restaurants and the content that describes them change. Deleting
-- the old restaurant rows cascades to their logs/reviews/tags/likes/comments
-- automatically (see the FK constraints in 20260910184702_init.sql), so this
-- migration only needs to insert the new restaurants + new logs/reviews on
-- top of that.

-- ---------------------------------------------------------------------------
-- New cuisine tags for the incoming restaurants (the fixed tag vocabulary
-- grows as real restaurants are added — see 20260910184708_seed_tags.sql).
-- ---------------------------------------------------------------------------
insert into tags (category, label, slug) values
  ('cuisine', 'Japanese',       'japanese'),
  ('cuisine', 'Greek',          'greek'),
  ('cuisine', 'Steakhouse',     'steakhouse'),
  ('cuisine', 'Middle Eastern', 'middle-eastern')
on conflict (category, slug) do nothing;

-- ---------------------------------------------------------------------------
-- Clean up stray test rows from earlier ad hoc Places verification —
-- "Kato Restaurant" (Los Angeles) picked up a real log+review ("Testing one
-- two three") while verifying the photo-upload pipeline, and "Sate Merah
-- Tebet" was created verifying Discovery's live search. Neither is part of
-- any intentional seed.
-- ---------------------------------------------------------------------------
delete from restaurants where google_place_id in (
  'ChIJnd0gSmi7woARCdXsW5usqKU', -- Kato Restaurant, Downtown Los Angeles
  'ChIJxx1G1EXzaS4RXx7zMRSxCYA'  -- Sate Merah Tebet, Jakarta Selatan
);

-- ---------------------------------------------------------------------------
-- Drop the 6 invented restaurants (cascades to their logs/reviews/tags/etc).
-- ---------------------------------------------------------------------------
delete from restaurants
where name in ('Osteria Fiorella', 'Mae Bird', 'Kato', 'Ilis', 'Dept of Culture', 'Bakmie Karet');

do $$
declare
  -- restaurants — real places, queried live from Google Places Text Search
  r_morimoto  uuid;
  r_estella   uuid;
  r_yialos    uuid;
  r_nineteen  uuid;
  r_darabicah uuid;
  r_sinchan   uuid;

  -- users (unchanged from the original seed)
  u_jordan uuid;
  u_aisha  uuid;
  u_ravi   uuid;
  u_sofia  uuid;
  u_leo    uuid;
  u_mei    uuid;

  -- scratch — every `insert into logs ... returning id` lands here; only the
  -- five reviews below that actually get tags/likes/comments get their own
  -- named variable.
  l_scratch uuid;

  -- reviews referenced later for tags/likes/comments
  rv_jordan_morimoto  uuid;
  rv_aisha_morimoto   uuid;
  rv_ravi_yialos      uuid;
  rv_sofia_darabicah  uuid;
  rv_ravi_sinchan     uuid;
begin
  select id into u_jordan from profiles where username = 'jordanreeves';
  select id into u_aisha  from profiles where username = 'aishak';
  select id into u_ravi   from profiles where username = 'ravim';
  select id into u_sofia  from profiles where username = 'sofiaa';
  select id into u_leo    from profiles where username = 'leot';
  select id into u_mei    from profiles where username = 'meiw';

  -- ---------------------------------------------------------------------
  -- restaurants — real name/address/lat-lng/cuisine/price, straight from
  -- the Places API (New) places:searchText response.
  -- ---------------------------------------------------------------------
  insert into restaurants (google_place_id, name, cuisine, price_level, area, city, address, lat, lng, about, website_url)
  values ('ChIJm_mBpuzxaS4RFi-v_15ufZ0', 'Morimoto Jakarta', 'Japanese', 4, 'SCBD', 'Jakarta',
          'District 8, SCBD, Lot 28, Senayan, Kebayoran Baru, South Jakarta City, Jakarta 12190',
          -6.2272953, 106.8064327,
          'Chef Masaharu Morimoto''s Jakarta outpost inside The Langham — sushi, robata, and his signature modern Japanese plates in a sleek SCBD dining room.',
          'https://www.langhamhotels.com/en/the-langham/jakarta/dine/morimoto-jakarta/')
  returning id into r_morimoto;

  insert into restaurants (google_place_id, name, cuisine, price_level, area, city, address, lat, lng, about, website_url)
  values ('ChIJK9KSCv_zaS4Rd99V941qT20', 'Estella Indonesian Family Restaurant', 'Indonesian', 2, 'Kemang', 'Jakarta',
          'Wisma 31, Jl. Kemang Raya No.31, Bangka, Mampang Prapatan, Jakarta Selatan 12730',
          -6.2553164, 106.8141582,
          'A Kemang institution for home-style Indonesian classics — big portions, big groups, and a menu that hasn''t needed to change in years.',
          'http://www.estella.co.id/')
  returning id into r_estella;

  insert into restaurants (google_place_id, name, cuisine, price_level, area, city, address, lat, lng, about, website_url)
  values ('ChIJBXvGAm71aS4RzY15Os1Nndo', 'Yialos Taverna Menteng', 'Greek', 4, 'Menteng', 'Jakarta',
          'Jl. Pasuruan No.1 & 3, Menteng, Jakarta Pusat 10310',
          -6.1998522, 106.8377304,
          'Whitewashed walls and Aegean plates in the middle of Menteng — grilled octopus, saganaki, and a wine list built for a long lunch.',
          'https://yialos.id/')
  returning id into r_yialos;

  insert into restaurants (google_place_id, name, cuisine, price_level, area, city, address, lat, lng, about, website_url)
  values ('ChIJbyr4FsHxaS4RLlsj7sU4N4g', 'The Nineteen Jakarta', 'Steakhouse', 4, 'Sudirman', 'Jakarta',
          'Jl. Jend. Sudirman kav 52-53 No.19, Senayan, Kebayoran Baru, Jakarta 12190',
          -6.2278817, 106.8106808,
          'A dry-aged-beef steakhouse tucked into the Sudirman strip — the kind of room you book for a deal closing or an anniversary.',
          'https://nineteenjkt.com/')
  returning id into r_nineteen;

  insert into restaurants (google_place_id, name, cuisine, price_level, area, city, address, lat, lng, about, website_url)
  values ('ChIJqXbVKvz1aS4Rc28-OMtr5c0', 'D''Arabicah Restaurant', 'Middle Eastern', 2, 'Cikini', 'Jakarta',
          'Jl. Cikini Raya No.86, Cikini, Menteng, Jakarta Pusat 10330',
          -6.1959378, 106.8396376,
          'One of Jakarta''s few spots for authentic Syrian-Arab cooking — mezze, grilled meats, and Arabic coffee on Cikini Raya.',
          null)
  returning id into r_darabicah;

  insert into restaurants (google_place_id, name, cuisine, price_level, area, city, address, lat, lng, about, website_url)
  values ('ChIJb9k4WgD1aS4Rjn72_TdtRZU', 'Nasi Telur Sinchan - Salemba', 'Indonesian', 2, 'Senen', 'Jakarta',
          'Jl. Salemba Raya No.24A-B, Kenari, Senen, Jakarta Pusat 10430',
          -6.198162, 106.851646,
          'A Salemba institution for nasi telur — fried rice topped with a crispy egg — that''s been drawing lines since long before it had a sign out front.',
          null)
  returning id into r_sinchan;

  -- ---------------------------------------------------------------------
  -- logs + reviews — same density/shape as the original seed (18 logs,
  -- a mix of go_to/visited/wishlist), rewritten to actually fit each real
  -- place instead of the old invented restaurants.
  -- ---------------------------------------------------------------------

  -- Jordan (home: SCBD) — three of these land on consecutive days so
  -- current_streak() has something to show on Home.
  insert into logs (user_id, restaurant_id, status) values (u_jordan, r_morimoto, 'go_to') returning id into l_scratch;
  insert into reviews (log_id, food_rating, vibe_rating, notes, visited_on)
    values (l_scratch, 9.0, 8.5, 'Omakase at the counter — the toro and the wagyu course alone are worth the splurge.', current_date)
    returning id into rv_jordan_morimoto;

  insert into logs (user_id, restaurant_id, status) values (u_jordan, r_yialos, 'go_to') returning id into l_scratch;
  insert into reviews (log_id, food_rating, vibe_rating, notes, visited_on)
    values (l_scratch, 8.5, 8.0, 'Grilled octopus and the lamb chops. Ask for the table by the window.', current_date - 1);

  insert into logs (user_id, restaurant_id, status) values (u_jordan, r_estella, 'visited') returning id into l_scratch;
  insert into reviews (log_id, food_rating, vibe_rating, notes, visited_on)
    values (l_scratch, 8.0, 7.0, 'Rendang and the fried tempeh — good for a fast, filling lunch.', current_date - 10);

  insert into logs (user_id, restaurant_id, status) values (u_jordan, r_darabicah, 'visited') returning id into l_scratch;
  insert into reviews (log_id, food_rating, vibe_rating, notes, visited_on)
    values (l_scratch, 9.0, 8.5, 'First time having real Syrian food in Jakarta. The mezze platter is generous.', current_date - 2);

  insert into logs (user_id, restaurant_id, status) values (u_jordan, r_nineteen, 'wishlist');
  insert into logs (user_id, restaurant_id, status) values (u_jordan, r_sinchan, 'wishlist');

  -- Aisha (home: Kemang)
  insert into logs (user_id, restaurant_id, status) values (u_aisha, r_morimoto, 'visited') returning id into l_scratch;
  insert into reviews (log_id, food_rating, vibe_rating, notes, visited_on)
    values (l_scratch, 9.0, 8.5, 'Splurged for a work anniversary. Every course was a small event.', current_date - 2)
    returning id into rv_aisha_morimoto;

  insert into logs (user_id, restaurant_id, status) values (u_aisha, r_estella, 'go_to') returning id into l_scratch;
  insert into reviews (log_id, food_rating, vibe_rating, notes, visited_on)
    values (l_scratch, 8.5, 8.0, 'My Sunday reset. The soto ayam is unbeatable.', current_date - 8);

  insert into logs (user_id, restaurant_id, status) values (u_aisha, r_yialos, 'visited') returning id into l_scratch;
  insert into reviews (log_id, food_rating, vibe_rating, notes, visited_on)
    values (l_scratch, 8.5, 9.5, 'Booked for a birthday. The saganaki alone got a round of applause.', current_date - 20);

  -- Ravi (home: Menteng)
  insert into logs (user_id, restaurant_id, status) values (u_ravi, r_yialos, 'go_to') returning id into l_scratch;
  insert into reviews (log_id, food_rating, vibe_rating, notes, visited_on)
    values (l_scratch, 10.0, 7.0, 'Come for the octopus, stay for the wine list.', current_date - 4)
    returning id into rv_ravi_yialos;

  insert into logs (user_id, restaurant_id, status) values (u_ravi, r_sinchan, 'visited') returning id into l_scratch;
  insert into reviews (log_id, food_rating, vibe_rating, notes, visited_on)
    values (l_scratch, 7.5, 8.0, 'Didn''t expect much, left thinking about it for days.', current_date - 5)
    returning id into rv_ravi_sinchan;

  insert into logs (user_id, restaurant_id, status) values (u_ravi, r_morimoto, 'visited') returning id into l_scratch;
  insert into reviews (log_id, food_rating, vibe_rating, notes, visited_on)
    values (l_scratch, 9.0, 8.0, 'Solo dinner at the sushi counter. Chef talked me through every piece.', current_date - 15);

  -- Sofia (home: Sudirman)
  insert into logs (user_id, restaurant_id, status) values (u_sofia, r_darabicah, 'visited') returning id into l_scratch;
  insert into reviews (log_id, food_rating, vibe_rating, notes, visited_on)
    values (l_scratch, 9.5, 9.0, 'Brought visiting family — they still talk about the lamb kofta.', current_date - 7)
    returning id into rv_sofia_darabicah;

  insert into logs (user_id, restaurant_id, status) values (u_sofia, r_nineteen, 'go_to') returning id into l_scratch;
  insert into reviews (log_id, food_rating, vibe_rating, notes, visited_on)
    values (l_scratch, 9.0, 9.5, 'The dry-aged ribeye is a full production. Book ahead.', current_date - 12);

  -- Leo (home: Cikini)
  insert into logs (user_id, restaurant_id, status) values (u_leo, r_estella, 'visited') returning id into l_scratch;
  insert into reviews (log_id, food_rating, vibe_rating, notes, visited_on)
    values (l_scratch, 8.0, 6.5, 'Solid comfort food, a little loud on a Friday night.', current_date - 9);

  insert into logs (user_id, restaurant_id, status) values (u_leo, r_morimoto, 'visited') returning id into l_scratch;
  insert into reviews (log_id, food_rating, vibe_rating, notes, visited_on)
    values (l_scratch, 9.0, 8.0, 'First date. We stayed until they turned the lights up.', current_date - 18);

  -- Mei (home: Senen)
  insert into logs (user_id, restaurant_id, status) values (u_mei, r_sinchan, 'visited') returning id into l_scratch;
  insert into reviews (log_id, food_rating, vibe_rating, notes, visited_on)
    values (l_scratch, 8.0, 7.5, 'Late-night nasi telur run. Never lets me down.', current_date - 2);

  insert into logs (user_id, restaurant_id, status) values (u_mei, r_yialos, 'visited') returning id into l_scratch;
  insert into reviews (log_id, food_rating, vibe_rating, notes, visited_on)
    values (l_scratch, 8.5, 7.0, 'Team lunch that ran three hours. Nobody wanted to leave.', current_date - 14);

  -- ---------------------------------------------------------------------
  -- review_tags — driving restaurant_tags_view (4 of the 6 restaurants get
  -- at least one tagged review, same 4-of-6 asymmetry as the original seed).
  -- ---------------------------------------------------------------------
  insert into review_tags (review_id, tag_id)
  select rv_jordan_morimoto, id from tags where slug in ('japanese', 'fancy', 'date-spot')
  union all
  select rv_aisha_morimoto, id from tags where slug in ('japanese', 'splurge', 'intimate')
  union all
  select rv_ravi_yialos, id from tags where slug in ('greek', 'adventurous', 'splurge')
  union all
  select rv_sofia_darabicah, id from tags where slug in ('middle-eastern', 'group-hangout', 'celebration')
  union all
  select rv_ravi_sinchan, id from tags where slug in ('indonesian', 'casual', 'budget', 'quick-bite');

  -- ---------------------------------------------------------------------
  -- likes + comments — a few, so Social/Post view show real counts
  -- ---------------------------------------------------------------------
  insert into likes (review_id, user_id) values
    (rv_aisha_morimoto, u_jordan), (rv_aisha_morimoto, u_ravi), (rv_aisha_morimoto, u_leo),
    (rv_ravi_yialos, u_jordan), (rv_ravi_yialos, u_mei),
    (rv_sofia_darabicah, u_jordan), (rv_sofia_darabicah, u_aisha);

  insert into comments (review_id, user_id, body) values
    (rv_aisha_morimoto, u_ravi, 'Adding this to my list!'),
    (rv_aisha_morimoto, u_jordan, 'The omakase really is that good.'),
    (rv_sofia_darabicah, u_leo, 'Been meaning to try this one.');

end $$;
