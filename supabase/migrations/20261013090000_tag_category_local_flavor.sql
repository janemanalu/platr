-- Platr — add the 6th tag category, Local Flavor.
--
-- On its own because a new enum value can't be used in the same transaction
-- that adds it; the next migration inserts the Local Flavor tags.

alter type tag_category add value if not exists 'local_flavor';
