import type {
  AdoptionRequest,
  Animal,
  AnimalView,
  Breed,
  CatDogDatabase,
  Size,
  Species,
} from "./types";
import {
  createSupabaseAdoptionRequest,
  createSupabaseAnimal,
  createSupabaseBreed,
  createSupabaseSize,
  createSupabaseSpecies,
  deleteSupabaseAnimal,
  deleteSupabaseBreed,
  deleteSupabaseSize,
  deleteSupabaseSpecies,
  readSupabaseDb,
  updateSupabaseAdoptionRequestStatus,
  updateSupabaseAnimal,
} from "./supabase-store";

function createId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export async function readDb(): Promise<CatDogDatabase> {
  return readSupabaseDb();
}

export function enrichAnimals(db: CatDogDatabase): AnimalView[] {
  return db.animals.map((animal) => ({
    ...animal,
    speciesName:
      db.species.find((species) => species.id === animal.speciesId)?.name ??
      "Nao informado",
    breedName:
      db.breeds.find((breed) => breed.id === animal.breedId)?.name ??
      "Nao informado",
    sizeName:
      db.sizes.find((size) => size.id === animal.sizeId)?.name ??
      "Nao informado",
  }));
}

export async function listCatalog() {
  const db = await readDb();
  return {
    ...db,
    animals: enrichAnimals(db),
  };
}

export async function createSpecies(input: Omit<Species, "id">) {
  await createSupabaseSpecies({ ...input, id: createId("sp") });
}

export async function deleteSpecies(id: string) {
  const db = await readDb();
  if (db.animals.some((animal) => animal.speciesId === id)) {
    throw new Error("Nao e possivel remover especie vinculada a animais.");
  }

  await deleteSupabaseSpecies(id);
}

export async function createBreed(input: Omit<Breed, "id">) {
  await createSupabaseBreed({ ...input, id: createId("br") });
}

export async function deleteBreed(id: string) {
  const db = await readDb();
  if (db.animals.some((animal) => animal.breedId === id)) {
    throw new Error("Nao e possivel remover raca vinculada a animais.");
  }

  await deleteSupabaseBreed(id);
}

export async function createSize(input: Omit<Size, "id">) {
  await createSupabaseSize({ ...input, id: createId("sz") });
}

export async function deleteSize(id: string) {
  const db = await readDb();
  if (db.animals.some((animal) => animal.sizeId === id)) {
    throw new Error("Nao e possivel remover porte vinculado a animais.");
  }

  await deleteSupabaseSize(id);
}

export async function createAnimal(input: Omit<Animal, "id" | "createdAt">) {
  await createSupabaseAnimal({
    ...input,
    id: createId("an"),
    createdAt: new Date().toISOString(),
  });
}

export async function updateAnimal(
  id: string,
  input: Omit<Animal, "id" | "createdAt">,
) {
  const db = await readDb();
  const existingAnimal = db.animals.find((animal) => animal.id === id);

  if (!existingAnimal) {
    throw new Error("Animal nao encontrado.");
  }

  await updateSupabaseAnimal({
    ...existingAnimal,
    ...input,
  });
}

export async function deleteAnimal(id: string) {
  await deleteSupabaseAnimal(id);
}

export async function createAdoptionRequest(
  input: Omit<AdoptionRequest, "id" | "status" | "createdAt">,
) {
  await createSupabaseAdoptionRequest({
    ...input,
    id: createId("req"),
    status: "received",
    createdAt: new Date().toISOString(),
  });
}

export async function updateAdoptionRequestStatus(
  id: string,
  status: AdoptionRequest["status"],
) {
  await updateSupabaseAdoptionRequestStatus(id, status);
}
