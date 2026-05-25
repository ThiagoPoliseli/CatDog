import { promises as fs } from "fs";
import path from "path";
import type {
  AdoptionRequest,
  Animal,
  AnimalView,
  Breed,
  CatDogDatabase,
  Size,
  Species,
} from "./types";

const dbPath = path.join(process.cwd(), "data", "catdog-db.json");

function createId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

async function ensureDatabase() {
  try {
    await fs.access(dbPath);
  } catch {
    await fs.mkdir(path.dirname(dbPath), { recursive: true });
    const emptyDb: CatDogDatabase = {
      species: [],
      breeds: [],
      sizes: [],
      animals: [],
      adoptionRequests: [],
    };
    await fs.writeFile(dbPath, JSON.stringify(emptyDb, null, 2));
  }
}

export async function readDb(): Promise<CatDogDatabase> {
  await ensureDatabase();
  const raw = await fs.readFile(dbPath, "utf-8");
  return JSON.parse(raw) as CatDogDatabase;
}

export async function writeDb(db: CatDogDatabase) {
  await fs.mkdir(path.dirname(dbPath), { recursive: true });
  await fs.writeFile(dbPath, JSON.stringify(db, null, 2));
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
  const db = await readDb();
  db.species.push({ ...input, id: createId("sp") });
  await writeDb(db);
}

export async function deleteSpecies(id: string) {
  const db = await readDb();
  if (db.animals.some((animal) => animal.speciesId === id)) {
    throw new Error("Nao e possivel remover especie vinculada a animais.");
  }
  db.species = db.species.filter((species) => species.id !== id);
  db.breeds = db.breeds.filter((breed) => breed.speciesId !== id);
  await writeDb(db);
}

export async function createBreed(input: Omit<Breed, "id">) {
  const db = await readDb();
  db.breeds.push({ ...input, id: createId("br") });
  await writeDb(db);
}

export async function deleteBreed(id: string) {
  const db = await readDb();
  if (db.animals.some((animal) => animal.breedId === id)) {
    throw new Error("Nao e possivel remover raca vinculada a animais.");
  }
  db.breeds = db.breeds.filter((breed) => breed.id !== id);
  await writeDb(db);
}

export async function createSize(input: Omit<Size, "id">) {
  const db = await readDb();
  db.sizes.push({ ...input, id: createId("sz") });
  await writeDb(db);
}

export async function deleteSize(id: string) {
  const db = await readDb();
  if (db.animals.some((animal) => animal.sizeId === id)) {
    throw new Error("Nao e possivel remover porte vinculado a animais.");
  }
  db.sizes = db.sizes.filter((size) => size.id !== id);
  await writeDb(db);
}

export async function createAnimal(input: Omit<Animal, "id" | "createdAt">) {
  const db = await readDb();
  db.animals.unshift({
    ...input,
    id: createId("an"),
    createdAt: new Date().toISOString(),
  });
  await writeDb(db);
}

export async function updateAnimal(
  id: string,
  input: Omit<Animal, "id" | "createdAt">,
) {
  const db = await readDb();
  db.animals = db.animals.map((animal) =>
    animal.id === id ? { ...animal, ...input } : animal,
  );
  await writeDb(db);
}

export async function deleteAnimal(id: string) {
  const db = await readDb();
  db.animals = db.animals.filter((animal) => animal.id !== id);
  db.adoptionRequests = db.adoptionRequests.filter(
    (request) => request.animalId !== id,
  );
  await writeDb(db);
}

export async function createAdoptionRequest(
  input: Omit<AdoptionRequest, "id" | "status" | "createdAt">,
) {
  const db = await readDb();
  const animal = db.animals.find((item) => item.id === input.animalId);

  if (!animal) {
    throw new Error("Animal nao encontrado.");
  }

  if (animal.status === "adopted") {
    throw new Error("Este animal ja foi adotado.");
  }

  db.adoptionRequests.unshift({
    ...input,
    id: createId("req"),
    status: "received",
    createdAt: new Date().toISOString(),
  });

  if (animal.status === "available") {
    animal.status = "in_process";
  }

  await writeDb(db);
}

export async function updateAdoptionRequestStatus(
  id: string,
  status: AdoptionRequest["status"],
) {
  const db = await readDb();
  db.adoptionRequests = db.adoptionRequests.map((request) =>
    request.id === id ? { ...request, status } : request,
  );
  await writeDb(db);
}
