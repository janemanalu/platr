-- Dev seed follow-up: give Jordan's demo account a real 3-day streak (today,
-- yesterday, the day before) instead of scattered dates that only streak to 1.
-- Cosmetic, dev-data only.

update reviews r
set visited_on = current_date
from logs l
where r.log_id = l.id and l.status = 'go_to' and r.notes like 'Hand-rolled cavatelli%';

update reviews r
set visited_on = current_date - 1
from logs l
where r.log_id = l.id and l.status = 'go_to' and r.notes like 'Never disappoints%';

update reviews r
set visited_on = current_date - 2
from logs l
where r.log_id = l.id and l.status = 'visited' and r.notes like 'Jollof rice flight%';
