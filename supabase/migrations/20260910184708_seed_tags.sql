-- Platr — tag vocabulary
--
-- The fixed, selectable tag list (Log a Visit: "fixed list — no custom tags").
-- Cuisine tags will grow as restaurants are added; the rest are closed sets.
-- Idempotent: safe to re-run.

insert into tags (category, label, slug) values
  -- cuisine
  ('cuisine', 'Italian',      'italian'),
  ('cuisine', 'Pasta',        'pasta'),
  ('cuisine', 'Wood-fired',   'wood-fired'),
  ('cuisine', 'Southern',     'southern'),
  ('cuisine', 'Taiwanese',    'taiwanese'),
  ('cuisine', 'New Nordic',   'new-nordic'),
  ('cuisine', 'Nigerian',     'nigerian'),
  ('cuisine', 'Indonesian',   'indonesian'),

  -- occasion
  ('occasion', 'Date spot',       'date-spot'),
  ('occasion', 'Anniversary',     'anniversary'),
  ('occasion', 'Business lunch',  'business-lunch'),
  ('occasion', 'Solo',            'solo'),
  ('occasion', 'Group Hangout',   'group-hangout'),
  ('occasion', 'Quick Bite',      'quick-bite'),
  ('occasion', 'Celebration',     'celebration'),

  -- vibe
  ('vibe', 'Cozy',          'cozy'),
  ('vibe', 'Dim lighting',  'dim-lighting'),
  ('vibe', 'Intimate',      'intimate'),
  ('vibe', 'Adventurous',   'adventurous'),
  ('vibe', 'Familiar',      'familiar'),
  ('vibe', 'Fancy',         'fancy'),
  ('vibe', 'Casual',        'casual'),

  -- price_point
  ('price_point', 'Budget',     'budget'),
  ('price_point', 'Mid-range',  'mid-range'),
  ('price_point', 'Splurge',    'splurge'),

  -- dietary
  ('dietary', 'Vegetarian options',      'vegetarian-options'),
  ('dietary', 'Gluten-free available',   'gluten-free-available'),
  ('dietary', 'Vegan options',           'vegan-options'),
  ('dietary', 'Halal',                   'halal')
on conflict (category, slug) do nothing;
