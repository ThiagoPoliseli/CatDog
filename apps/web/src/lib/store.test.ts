import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./supabase-store", () => ({
  readSupabaseDb: vi.fn(),
  createSupabaseSpecies: vi.fn(),
  deleteSupabaseSpecies: vi.fn(),
  createSupabaseBreed: vi.fn(),
  deleteSupabaseBreed: vi.fn(),
  createSupabaseSize: vi.fn(),
  deleteSupabaseSize: vi.fn(),
  createSupabaseAnimal: vi.fn(),
  updateSupabaseAnimal: vi.fn(),
  deleteSupabaseAnimal: vi.fn(),
  createSupabaseAdoptionRequest: vi.fn(),
  listUserSupabaseAdoptionRequests: vi.fn(),
  updateSupabaseAdoptionRequestStatus: vi.fn(),
  uploadAnimalImage: vi.fn(),
  hasSupabaseServiceRoleKey: vi.fn(),
}));

import {
  enrichAnimals,
  listCatalog,
  createSpecies,
  deleteSpecies,
  createBreed,
  deleteBreed,
  createSize,
  deleteSize,
  createAnimal,
  updateAnimal,
  deleteAnimal,
  createAdoptionRequest,
  listUserAdoptionRequests,
  updateAdoptionRequestStatus,
} from "./store";
import * as supabaseStore from "./supabase-store";
import type { CatDogDatabase } from "./types";

const baseDb: CatDogDatabase = {
  species: [{ id: "sp1", name: "Gato", slug: "gato" }],
  breeds: [{ id: "br1", name: "Persa", speciesId: "sp1" }],
  sizes: [{ id: "sz1", name: "Pequeno", slug: "pequeno" }],
  animals: [
    {
      id: "an1",
      name: "Miau",
      speciesId: "sp1",
      breedId: "br1",
      sizeId: "sz1",
      ageMonths: 12,
      sex: "Femea",
      city: "SP",
      state: "SP",
      description: "Um gato persa",
      status: "available",
      imageUrl: "https://example.com/img.jpg",
      createdAt: "2024-01-01",
    },
  ],
  adoptionRequests: [],
};

beforeEach(() => vi.clearAllMocks());

describe("enrichAnimals", () => {
  it("enriches animals with species, breed and size names", () => {
    const result = enrichAnimals(baseDb);
    expect(result[0].speciesName).toBe("Gato");
    expect(result[0].breedName).toBe("Persa");
    expect(result[0].sizeName).toBe("Pequeno");
  });

  it("uses fallback when related entity not found", () => {
    const db: CatDogDatabase = {
      ...baseDb,
      species: [],
      breeds: [],
      sizes: [],
    };
    const result = enrichAnimals(db);
    expect(result[0].speciesName).toBe("Nao informado");
    expect(result[0].breedName).toBe("Nao informado");
    expect(result[0].sizeName).toBe("Nao informado");
  });

  it("returns empty array for empty animals list", () => {
    expect(enrichAnimals({ ...baseDb, animals: [] })).toEqual([]);
  });
});

describe("listCatalog", () => {
  it("returns db merged with enriched animals", async () => {
    vi.mocked(supabaseStore.readSupabaseDb).mockResolvedValue(baseDb);
    const catalog = await listCatalog();
    expect(catalog.species).toEqual(baseDb.species);
    expect(catalog.animals[0].speciesName).toBe("Gato");
  });
});

describe("createSpecies", () => {
  it("delegates to createSupabaseSpecies with generated id and slug", async () => {
    vi.mocked(supabaseStore.createSupabaseSpecies).mockResolvedValue(undefined);
    await createSpecies({ name: "Cao", slug: "cao" });
    expect(supabaseStore.createSupabaseSpecies).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Cao", slug: "cao" }),
    );
  });
});

describe("deleteSpecies", () => {
  it("throws when species is linked to animals", async () => {
    vi.mocked(supabaseStore.readSupabaseDb).mockResolvedValue(baseDb);
    await expect(deleteSpecies("sp1")).rejects.toThrow("Nao e possivel remover especie vinculada a animais.");
  });

  it("deletes when no animals use the species", async () => {
    vi.mocked(supabaseStore.readSupabaseDb).mockResolvedValue({ ...baseDb, animals: [] });
    vi.mocked(supabaseStore.deleteSupabaseSpecies).mockResolvedValue(undefined);
    await deleteSpecies("sp1");
    expect(supabaseStore.deleteSupabaseSpecies).toHaveBeenCalledWith("sp1");
  });
});

describe("createBreed", () => {
  it("delegates to createSupabaseBreed with generated id", async () => {
    vi.mocked(supabaseStore.createSupabaseBreed).mockResolvedValue(undefined);
    await createBreed({ name: "Labrador", speciesId: "sp1" });
    expect(supabaseStore.createSupabaseBreed).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Labrador", speciesId: "sp1" }),
    );
  });
});

describe("deleteBreed", () => {
  it("throws when breed is linked to animals", async () => {
    vi.mocked(supabaseStore.readSupabaseDb).mockResolvedValue(baseDb);
    await expect(deleteBreed("br1")).rejects.toThrow("Nao e possivel remover raca vinculada a animais.");
  });

  it("deletes when no animals use the breed", async () => {
    vi.mocked(supabaseStore.readSupabaseDb).mockResolvedValue({ ...baseDb, animals: [] });
    vi.mocked(supabaseStore.deleteSupabaseBreed).mockResolvedValue(undefined);
    await deleteBreed("br1");
    expect(supabaseStore.deleteSupabaseBreed).toHaveBeenCalledWith("br1");
  });
});

describe("createSize", () => {
  it("delegates to createSupabaseSize with generated id", async () => {
    vi.mocked(supabaseStore.createSupabaseSize).mockResolvedValue(undefined);
    await createSize({ name: "Grande", slug: "grande" });
    expect(supabaseStore.createSupabaseSize).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Grande", slug: "grande" }),
    );
  });
});

describe("deleteSize", () => {
  it("throws when size is linked to animals", async () => {
    vi.mocked(supabaseStore.readSupabaseDb).mockResolvedValue(baseDb);
    await expect(deleteSize("sz1")).rejects.toThrow("Nao e possivel remover porte vinculado a animais.");
  });

  it("deletes when no animals use the size", async () => {
    vi.mocked(supabaseStore.readSupabaseDb).mockResolvedValue({ ...baseDb, animals: [] });
    vi.mocked(supabaseStore.deleteSupabaseSize).mockResolvedValue(undefined);
    await deleteSize("sz1");
    expect(supabaseStore.deleteSupabaseSize).toHaveBeenCalledWith("sz1");
  });
});

describe("createAnimal", () => {
  it("delegates with generated id and createdAt", async () => {
    vi.mocked(supabaseStore.createSupabaseAnimal).mockResolvedValue(undefined);
    const input = { ...baseDb.animals[0] };
    const { id, createdAt, ...animalInput } = input;
    await createAnimal(animalInput);
    expect(supabaseStore.createSupabaseAnimal).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Miau", status: "available" }),
    );
  });
});

describe("updateAnimal", () => {
  it("throws when animal is not found", async () => {
    vi.mocked(supabaseStore.readSupabaseDb).mockResolvedValue({ ...baseDb, animals: [] });
    const { id, createdAt, ...fields } = baseDb.animals[0];
    await expect(updateAnimal("nonexistent", fields)).rejects.toThrow("Animal nao encontrado.");
  });

  it("updates when animal exists", async () => {
    vi.mocked(supabaseStore.readSupabaseDb).mockResolvedValue(baseDb);
    vi.mocked(supabaseStore.updateSupabaseAnimal).mockResolvedValue(undefined);
    const { id, createdAt, ...fields } = baseDb.animals[0];
    await updateAnimal("an1", fields);
    expect(supabaseStore.updateSupabaseAnimal).toHaveBeenCalledWith(
      expect.objectContaining({ id: "an1" }),
    );
  });
});

describe("deleteAnimal", () => {
  it("delegates to deleteSupabaseAnimal", async () => {
    vi.mocked(supabaseStore.deleteSupabaseAnimal).mockResolvedValue(undefined);
    await deleteAnimal("an1");
    expect(supabaseStore.deleteSupabaseAnimal).toHaveBeenCalledWith("an1");
  });
});

describe("createAdoptionRequest", () => {
  it("delegates with generated id, received status and createdAt", async () => {
    vi.mocked(supabaseStore.createSupabaseAdoptionRequest).mockResolvedValue(undefined);
    await createAdoptionRequest({
      animalId: "an1",
      adopterName: "Joao",
      email: "joao@example.com",
      phone: "(11) 99999-1234",
      message: "Interesse em adotar",
      userId: "u1",
    });
    expect(supabaseStore.createSupabaseAdoptionRequest).toHaveBeenCalledWith(
      expect.objectContaining({ status: "received", animalId: "an1" }),
    );
  });
});

describe("listUserAdoptionRequests", () => {
  it("delegates to listUserSupabaseAdoptionRequests", async () => {
    vi.mocked(supabaseStore.listUserSupabaseAdoptionRequests).mockResolvedValue([]);
    await listUserAdoptionRequests("u1");
    expect(supabaseStore.listUserSupabaseAdoptionRequests).toHaveBeenCalledWith("u1");
  });
});

describe("updateAdoptionRequestStatus", () => {
  it("delegates to updateSupabaseAdoptionRequestStatus", async () => {
    vi.mocked(supabaseStore.updateSupabaseAdoptionRequestStatus).mockResolvedValue(undefined);
    await updateAdoptionRequestStatus("req1", "approved");
    expect(supabaseStore.updateSupabaseAdoptionRequestStatus).toHaveBeenCalledWith("req1", "approved");
  });
});
