import { createClient } from "@supabase/supabase-js";
import type {
  AdoptionRequest,
  Animal,
  Breed,
  CatDogDatabase,
  Size,
  Species,
} from "./types";

type SupabaseSpecies = {
  id: string;
  name: string;
  slug: string;
};

type SupabaseBreed = {
  id: string;
  name: string;
  species_id: string;
};

type SupabaseSize = {
  id: string;
  name: string;
  slug: string;
};

type SupabaseAnimal = {
  id: string;
  name: string;
  species_id: string;
  breed_id: string;
  size_id: string;
  age_months: number;
  sex: Animal["sex"];
  city: string;
  state: string;
  description: string;
  status: Animal["status"];
  image_url: string;
  created_at: string;
};

type SupabaseAdoptionRequest = {
  id: string;
  animal_id: string;
  adopter_name: string;
  email: string;
  phone: string;
  message: string;
  status: AdoptionRequest["status"];
  created_at: string;
};

function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL;
}

function getSupabaseKey() {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function hasSupabaseServiceRoleKey() {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function getSupabase() {
  const url = getSupabaseUrl();
  const key = getSupabaseKey();

  if (!url || !key) {
    throw new Error("Credenciais do Supabase nao configuradas.");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function requireServiceRoleKey() {
  if (!hasSupabaseServiceRoleKey()) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY e necessaria para operacoes administrativas.",
    );
  }
}

function toSpecies(row: SupabaseSpecies): Species {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
  };
}

function toBreed(row: SupabaseBreed): Breed {
  return {
    id: row.id,
    name: row.name,
    speciesId: row.species_id,
  };
}

function toSize(row: SupabaseSize): Size {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
  };
}

function toAnimal(row: SupabaseAnimal): Animal {
  return {
    id: row.id,
    name: row.name,
    speciesId: row.species_id,
    breedId: row.breed_id,
    sizeId: row.size_id,
    ageMonths: row.age_months,
    sex: row.sex,
    city: row.city,
    state: row.state,
    description: row.description,
    status: row.status,
    imageUrl: row.image_url,
    createdAt: row.created_at,
  };
}

function toAdoptionRequest(row: SupabaseAdoptionRequest): AdoptionRequest {
  return {
    id: row.id,
    animalId: row.animal_id,
    adopterName: row.adopter_name,
    email: row.email,
    phone: row.phone,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
  };
}

function fromBreed(breed: Breed): SupabaseBreed {
  return {
    id: breed.id,
    name: breed.name,
    species_id: breed.speciesId,
  };
}

function fromSize(size: Size): SupabaseSize {
  return {
    id: size.id,
    name: size.name,
    slug: size.slug,
  };
}

function fromSpecies(species: Species): SupabaseSpecies {
  return {
    id: species.id,
    name: species.name,
    slug: species.slug,
  };
}

function fromAnimal(animal: Animal): SupabaseAnimal {
  return {
    id: animal.id,
    name: animal.name,
    species_id: animal.speciesId,
    breed_id: animal.breedId,
    size_id: animal.sizeId,
    age_months: animal.ageMonths,
    sex: animal.sex,
    city: animal.city,
    state: animal.state,
    description: animal.description,
    status: animal.status,
    image_url: animal.imageUrl,
    created_at: animal.createdAt,
  };
}

function fromAdoptionRequest(
  request: AdoptionRequest,
): SupabaseAdoptionRequest {
  return {
    id: request.id,
    animal_id: request.animalId,
    adopter_name: request.adopterName,
    email: request.email,
    phone: request.phone,
    message: request.message,
    status: request.status,
    created_at: request.createdAt,
  };
}

async function assertNoError(error: unknown) {
  if (error) {
    throw error;
  }
}

export async function readSupabaseDb(): Promise<CatDogDatabase> {
  const supabase = getSupabase();

  const [species, breeds, sizes, animals, adoptionRequests] = await Promise.all([
    supabase.from("species").select("*").order("name"),
    supabase.from("breeds").select("*").order("name"),
    supabase.from("sizes").select("*").order("name"),
    supabase.from("animals").select("*").order("created_at", {
      ascending: false,
    }),
    hasSupabaseServiceRoleKey()
      ? supabase.from("adoption_requests").select("*").order("created_at", {
          ascending: false,
        })
      : Promise.resolve({ data: [], error: null }),
  ]);

  await Promise.all([
    assertNoError(species.error),
    assertNoError(breeds.error),
    assertNoError(sizes.error),
    assertNoError(animals.error),
    assertNoError(adoptionRequests.error),
  ]);

  return {
    species: (species.data ?? []).map(toSpecies),
    breeds: (breeds.data ?? []).map(toBreed),
    sizes: (sizes.data ?? []).map(toSize),
    animals: (animals.data ?? []).map(toAnimal),
    adoptionRequests: (adoptionRequests.data ?? []).map(toAdoptionRequest),
  };
}

export async function createSupabaseSpecies(species: Species) {
  requireServiceRoleKey();
  const supabase = getSupabase();
  await assertNoError(
    (await supabase.from("species").insert(fromSpecies(species))).error,
  );
}

export async function deleteSupabaseSpecies(id: string) {
  requireServiceRoleKey();
  const supabase = getSupabase();
  await assertNoError((await supabase.from("species").delete().eq("id", id)).error);
}

export async function createSupabaseBreed(breed: Breed) {
  requireServiceRoleKey();
  const supabase = getSupabase();
  await assertNoError(
    (await supabase.from("breeds").insert(fromBreed(breed))).error,
  );
}

export async function deleteSupabaseBreed(id: string) {
  requireServiceRoleKey();
  const supabase = getSupabase();
  await assertNoError((await supabase.from("breeds").delete().eq("id", id)).error);
}

export async function createSupabaseSize(size: Size) {
  requireServiceRoleKey();
  const supabase = getSupabase();
  await assertNoError((await supabase.from("sizes").insert(fromSize(size))).error);
}

export async function deleteSupabaseSize(id: string) {
  requireServiceRoleKey();
  const supabase = getSupabase();
  await assertNoError((await supabase.from("sizes").delete().eq("id", id)).error);
}

export async function createSupabaseAnimal(animal: Animal) {
  requireServiceRoleKey();
  const supabase = getSupabase();
  await assertNoError(
    (await supabase.from("animals").insert(fromAnimal(animal))).error,
  );
}

export async function updateSupabaseAnimal(animal: Animal) {
  requireServiceRoleKey();
  const supabase = getSupabase();
  await assertNoError(
    (
      await supabase
        .from("animals")
        .update(fromAnimal(animal))
        .eq("id", animal.id)
    ).error,
  );
}

export async function deleteSupabaseAnimal(id: string) {
  requireServiceRoleKey();
  const supabase = getSupabase();
  await assertNoError((await supabase.from("animals").delete().eq("id", id)).error);
}

export async function updateSupabaseAdoptionRequestStatus(
  id: string,
  status: AdoptionRequest["status"],
) {
  requireServiceRoleKey();
  const supabase = getSupabase();
  await assertNoError(
    (
      await supabase
        .from("adoption_requests")
        .update({ status })
        .eq("id", id)
    ).error,
  );
}

export async function createSupabaseAdoptionRequest(
  request: AdoptionRequest,
) {
  const supabase = getSupabase();
  const { data: animal, error: animalError } = await supabase
    .from("animals")
    .select("id,status")
    .eq("id", request.animalId)
    .single();

  await assertNoError(animalError);

  if (!animal) {
    throw new Error("Animal nao encontrado.");
  }

  if (animal.status === "adopted") {
    throw new Error("Este animal ja foi adotado.");
  }

  await assertNoError(
    (
      await supabase
        .from("adoption_requests")
        .insert(fromAdoptionRequest(request))
    ).error,
  );

  if (animal.status === "available" && hasSupabaseServiceRoleKey()) {
    await assertNoError(
      (
        await supabase
          .from("animals")
          .update({ status: "in_process" })
          .eq("id", request.animalId)
      ).error,
    );
  }
}
