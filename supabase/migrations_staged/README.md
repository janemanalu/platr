# Staged migrations

`supabase db push` applies every file in `supabase/migrations/` that hasn't run
yet, all at once. Files here would break the app as it is today, so they wait
until the code that depends on them has shipped. Then move the file into
`supabase/migrations/` with a fresh timestamp and push.

| File | Move in when |
|---|---|
| `drop_review_photos.sql` | The app reads and writes photos only through `media` (end of build step 2). |
