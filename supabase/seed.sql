insert into species (id, name, slug) values
  ('sp-dog', 'Cachorro', 'cachorro'),
  ('sp-cat', 'Gato', 'gato')
on conflict (id) do update set name = excluded.name, slug = excluded.slug;

insert into sizes (id, name, slug) values
  ('sz-small', 'Pequeno', 'pequeno'),
  ('sz-medium', 'Medio', 'medio'),
  ('sz-large', 'Grande', 'grande')
on conflict (id) do update set name = excluded.name, slug = excluded.slug;

insert into breeds (id, name, species_id) values
  ('br-srd-dog', 'Sem raca definida', 'sp-dog'),
  ('br-srd-cat', 'Sem raca definida', 'sp-cat'),
  ('br-samoyed', 'Samoieda', 'sp-dog'),
  ('br-siamese', 'Siames', 'sp-cat')
on conflict (id) do update set name = excluded.name, species_id = excluded.species_id;

insert into animals (
  id,
  name,
  species_id,
  breed_id,
  size_id,
  age_months,
  sex,
  city,
  state,
  description,
  status,
  image_url,
  created_at
) values
  (
    'an-theo',
    'Theo',
    'sp-dog',
    'br-samoyed',
    'sz-medium',
    24,
    'Macho',
    'Campo Magro',
    'PR',
    'Cao alegre, sociavel e pronto para uma familia que goste de passeios.',
    'available',
    'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=900&q=80',
    '2026-05-24T00:00:00.000Z'
  ),
  (
    'an-luna',
    'Luna',
    'sp-cat',
    'br-siamese',
    'sz-small',
    14,
    'Femea',
    'Curitiba',
    'PR',
    'Gata calma, carinhosa e adaptada a ambientes internos.',
    'in_process',
    'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=900&q=80',
    '2026-05-24T00:00:00.000Z'
  ),
  (
    'an-bento',
    'Bento',
    'sp-dog',
    'br-srd-dog',
    'sz-large',
    36,
    'Macho',
    'Sao Jose dos Pinhais',
    'PR',
    'Cao protetor, brincalhao e indicado para casa com espaco.',
    'available',
    'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80',
    '2026-05-24T00:00:00.000Z'
  ),
  (
    'an-mel',
    'Mel',
    'sp-cat',
    'br-srd-cat',
    'sz-small',
    8,
    'Femea',
    'Pinhais',
    'PR',
    'Filhote curiosa, ativa e em busca de um lar seguro.',
    'adopted',
    'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=900&q=80',
    '2026-05-24T00:00:00.000Z'
  )
on conflict (id) do update set
  name = excluded.name,
  species_id = excluded.species_id,
  breed_id = excluded.breed_id,
  size_id = excluded.size_id,
  age_months = excluded.age_months,
  sex = excluded.sex,
  city = excluded.city,
  state = excluded.state,
  description = excluded.description,
  status = excluded.status,
  image_url = excluded.image_url,
  created_at = excluded.created_at;

insert into adoption_requests (
  id,
  animal_id,
  adopter_name,
  email,
  phone,
  message,
  status,
  created_at
) values (
  'req-demo',
  'an-theo',
  'Maria Silva',
  'maria@example.com',
  '(41) 99999-0000',
  'Tenho interesse em conhecer o Theo e entender os proximos passos.',
  'received',
  '2026-05-24T00:00:00.000Z'
)
on conflict (id) do update set
  animal_id = excluded.animal_id,
  adopter_name = excluded.adopter_name,
  email = excluded.email,
  phone = excluded.phone,
  message = excluded.message,
  status = excluded.status,
  created_at = excluded.created_at;
