-- Platr — who can see what.
--
-- Profile sections: every list (Go-To, Visited, Wishlist, Blacklisted) keeps
-- its own public/private toggle, enforced here through is_status_public, which
-- logs RLS already uses. Defaults: Go-To and Visited public, Wishlist and
-- Blacklisted private.
--
-- Posts: a visit is a post only when its log is Visited or Go-To. Wishlist and
-- Blacklisted visits never appear as posts to anyone else, even when that
-- profile section is public (the section then shows the restaurant only, not
-- the visit's ratings or notes). review_is_visible enforces this, and likes,
-- comments, review tags, media and logged stories all go through it.
--
-- Gallery: its own public/private flag on profiles (default public). It
-- controls the Gallery section; the same photos still appear inside posts
-- wherever the post itself is visible.

-- ---------------------------------------------------------------------------
-- Defaults for new profiles
-- ---------------------------------------------------------------------------
create or replace function seed_status_privacy()
returns trigger
language plpgsql
as $$
begin
  insert into public.status_list_privacy (user_id, status, is_public)
  values (new.id, 'visited',     true),
         (new.id, 'go_to',       true),
         (new.id, 'wishlist',    false),
         (new.id, 'blacklisted', false);
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Posts: only Visited / Go-To visits are ever visible to others
-- ---------------------------------------------------------------------------
create or replace function review_is_visible(_review_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from reviews r
    join logs l on l.id = r.log_id
    where r.id = _review_id
      and (
        l.user_id = auth.uid()
        or (l.status in ('visited', 'go_to') and is_status_public(l.user_id, l.status))
      )
  );
$$;

drop policy if exists reviews_select on reviews;
create policy reviews_select on reviews for select
  using (review_is_visible(id));

-- ---------------------------------------------------------------------------
-- Gallery section privacy
-- ---------------------------------------------------------------------------
alter table profiles
  add column gallery_public boolean not null default true;

-- True if the caller may see `_user_id`'s Gallery section.
create or replace function gallery_visible(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select _user_id = auth.uid()
      or coalesce((select gallery_public from profiles where id = _user_id), false);
$$;
