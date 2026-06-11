alter table adoption_requests
  drop constraint if exists adoption_requests_status_check;

alter table adoption_requests
  add constraint adoption_requests_status_check
  check (status in ('received', 'reviewing', 'approved', 'rejected', 'completed', 'cancelled'));
