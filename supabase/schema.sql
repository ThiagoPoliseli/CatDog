create table if not exists species (
  id text primary key,
  name text not null,
  slug text not null unique
);

create table if not exists sizes (
  id text primary key,
  name text not null,
  slug text not null unique
);

create table if not exists breeds (
  id text primary key,
  name text not null,
  species_id text not null references species(id) on delete cascade
);

create table if not exists animals (
  id text primary key,
  name text not null,
  species_id text not null references species(id),
  breed_id text not null references breeds(id),
  size_id text not null references sizes(id),
  age_months integer not null check (age_months >= 0),
  sex text not null check (sex in ('Macho', 'Femea')),
  city text not null,
  state text not null,
  description text not null,
  status text not null check (status in ('available', 'in_process', 'adopted')),
  image_url text not null,
  created_at timestamptz not null default now()
);

create table if not exists adoption_requests (
  id text primary key,
  animal_id text not null references animals(id) on delete cascade,
  adopter_name text not null,
  email text not null,
  phone text not null,
  message text not null,
  status text not null check (
    status in ('received', 'reviewing', 'approved', 'rejected', 'completed', 'cancelled')
  ),
  created_at timestamptz not null default now()
);

create index if not exists breeds_species_id_idx on breeds(species_id);
create index if not exists animals_species_id_idx on animals(species_id);
create index if not exists animals_breed_id_idx on animals(breed_id);
create index if not exists animals_size_id_idx on animals(size_id);
create index if not exists animals_status_idx on animals(status);
create index if not exists adoption_requests_animal_id_idx on adoption_requests(animal_id);

create or replace function validate_adoption_request_animal()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_status text;
begin
  select status into current_status
  from animals
  where id = new.animal_id;

  if current_status is null then
    raise exception 'Animal nao encontrado.';
  end if;

  if current_status = 'adopted' then
    raise exception 'Este animal ja foi adotado.';
  end if;

  return new;
end;
$$;

create or replace function set_animal_in_process_on_adoption_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update animals
  set status = 'in_process'
  where id = new.animal_id
    and status = 'available';

  return new;
end;
$$;

drop trigger if exists validate_adoption_request_animal on adoption_requests;
drop trigger if exists set_animal_in_process_on_adoption_request on adoption_requests;

create trigger validate_adoption_request_animal
before insert on adoption_requests
for each row
execute function validate_adoption_request_animal();

create trigger set_animal_in_process_on_adoption_request
after insert on adoption_requests
for each row
execute function set_animal_in_process_on_adoption_request();

alter table species enable row level security;
alter table sizes enable row level security;
alter table breeds enable row level security;
alter table animals enable row level security;
alter table adoption_requests enable row level security;

drop policy if exists "public read species" on species;
drop policy if exists "public read sizes" on sizes;
drop policy if exists "public read breeds" on breeds;
drop policy if exists "public read animals" on animals;
drop policy if exists "public create adoption requests" on adoption_requests;
drop policy if exists "service role manage species" on species;
drop policy if exists "service role manage sizes" on sizes;
drop policy if exists "service role manage breeds" on breeds;
drop policy if exists "service role manage animals" on animals;
drop policy if exists "service role manage adoption requests" on adoption_requests;

create policy "public read species" on species for select using (true);
create policy "public read sizes" on sizes for select using (true);
create policy "public read breeds" on breeds for select using (true);
create policy "public read animals" on animals for select using (true);
create policy "public create adoption requests" on adoption_requests
  for insert with check (true);

create policy "service role manage species" on species
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role manage sizes" on sizes
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role manage breeds" on breeds
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role manage animals" on animals
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role manage adoption requests" on adoption_requests
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
