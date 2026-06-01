alter table adoption_requests
  add column if not exists user_id uuid references auth.users(id);

create index if not exists adoption_requests_user_id_idx on adoption_requests(user_id);

drop policy if exists "users read own requests" on adoption_requests;
create policy "users read own requests" on adoption_requests
  for select using (auth.uid() = user_id);
