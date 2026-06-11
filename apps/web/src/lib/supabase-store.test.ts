import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Build a chainable, thenable Supabase query mock
function makeChain(result: { data: any; error: any }) {
  const chain: Record<string, any> = {
    then(onFulfilled: any, onRejected?: any) {
      return Promise.resolve(result).then(onFulfilled, onRejected);
    },
    catch(onRejected: any) {
      return Promise.resolve(result).catch(onRejected);
    },
  };
  for (const m of ["select", "insert", "update", "delete", "order", "eq", "in", "upsert"]) {
    chain[m] = vi.fn().mockReturnValue(chain);
  }
  chain.single = vi.fn().mockResolvedValue(result);
  return chain;
}

const mockFrom = vi.fn();
const mockUpload = vi.fn();
const mockGetPublicUrl = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    from: mockFrom,
    storage: {
      from: vi.fn().mockReturnValue({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      }),
    },
  })),
}));

import {
  hasSupabaseServiceRoleKey,
  readSupabaseDb,
  createSupabaseSpecies,
  deleteSupabaseSpecies,
  createSupabaseBreed,
  deleteSupabaseBreed,
  createSupabaseSize,
  deleteSupabaseSize,
  createSupabaseAnimal,
  updateSupabaseAnimal,
  deleteSupabaseAnimal,
  createSupabaseAdoptionRequest,
  updateSupabaseAdoptionRequestStatus,
  listUserSupabaseAdoptionRequests,
  uploadAnimalImage,
} from "./supabase-store";

const savedUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const savedAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const savedSrk = process.env.SUPABASE_SERVICE_ROLE_KEY;

beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
});

afterEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = savedUrl;
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = savedAnon;
  process.env.SUPABASE_SERVICE_ROLE_KEY = savedSrk;
});

describe("hasSupabaseServiceRoleKey", () => {
  it("returns true when SUPABASE_SERVICE_ROLE_KEY is set", () => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = "key";
    expect(hasSupabaseServiceRoleKey()).toBe(true);
  });

  it("returns false when SUPABASE_SERVICE_ROLE_KEY is not set", () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    expect(hasSupabaseServiceRoleKey()).toBe(false);
  });
});

describe("readSupabaseDb", () => {
  it("maps Supabase rows to domain types", async () => {
    const speciesRow = { id: "sp1", name: "Gato", slug: "gato" };
    const breedRow = { id: "br1", name: "Persa", species_id: "sp1" };
    const sizeRow = { id: "sz1", name: "Pequeno", slug: "pequeno" };
    const animalRow = {
      id: "an1", name: "Miau", species_id: "sp1", breed_id: "br1",
      size_id: "sz1", age_months: 12, sex: "Femea", city: "SP", state: "SP",
      description: "Gato fofo", status: "available",
      image_url: "https://example.com/img.jpg", created_at: "2024-01-01",
    };
    const requestRow = {
      id: "req1", animal_id: "an1", adopter_name: "Joao", email: "j@e.com",
      phone: "(11) 9999-1234", message: "Quero adotar", status: "received",
      created_at: "2024-01-01", user_id: "u1",
    };

    mockFrom
      .mockReturnValueOnce(makeChain({ data: [speciesRow], error: null }))
      .mockReturnValueOnce(makeChain({ data: [breedRow], error: null }))
      .mockReturnValueOnce(makeChain({ data: [sizeRow], error: null }))
      .mockReturnValueOnce(makeChain({ data: [animalRow], error: null }))
      .mockReturnValueOnce(makeChain({ data: [requestRow], error: null }));

    const db = await readSupabaseDb();

    expect(db.species[0]).toEqual({ id: "sp1", name: "Gato", slug: "gato" });
    expect(db.breeds[0]).toEqual({ id: "br1", name: "Persa", speciesId: "sp1" });
    expect(db.sizes[0]).toEqual({ id: "sz1", name: "Pequeno", slug: "pequeno" });
    expect(db.animals[0].speciesId).toBe("sp1");
    expect(db.animals[0].ageMonths).toBe(12);
    expect(db.animals[0].imageUrl).toBe("https://example.com/img.jpg");
    expect(db.adoptionRequests[0].animalId).toBe("an1");
    expect(db.adoptionRequests[0].adopterName).toBe("Joao");
  });

  it("skips adoption requests when no service role key", async () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    mockFrom.mockReturnValue(makeChain({ data: [], error: null }));

    const db = await readSupabaseDb();
    expect(db.adoptionRequests).toEqual([]);
  });

  it("throws when a query returns an error", async () => {
    mockFrom
      .mockReturnValueOnce(makeChain({ data: null, error: new Error("DB error") }))
      .mockReturnValue(makeChain({ data: [], error: null }));

    await expect(readSupabaseDb()).rejects.toThrow("DB error");
  });

  it("throws when credentials are missing", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    await expect(readSupabaseDb()).rejects.toThrow("Credenciais do Supabase nao configuradas.");
  });
});

describe("createSupabaseSpecies", () => {
  it("throws when service role key is missing", async () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    await expect(createSupabaseSpecies({ id: "sp1", name: "Gato", slug: "gato" })).rejects.toThrow(
      "SUPABASE_SERVICE_ROLE_KEY",
    );
  });

  it("inserts species and propagates Supabase errors", async () => {
    mockFrom.mockReturnValue(makeChain({ data: null, error: new Error("Insert failed") }));
    await expect(createSupabaseSpecies({ id: "sp1", name: "Gato", slug: "gato" })).rejects.toThrow("Insert failed");
  });

  it("succeeds with no error", async () => {
    mockFrom.mockReturnValue(makeChain({ data: null, error: null }));
    await expect(createSupabaseSpecies({ id: "sp1", name: "Gato", slug: "gato" })).resolves.toBeUndefined();
  });
});

describe("deleteSupabaseSpecies", () => {
  it("deletes species row", async () => {
    mockFrom.mockReturnValue(makeChain({ data: null, error: null }));
    await expect(deleteSupabaseSpecies("sp1")).resolves.toBeUndefined();
  });
});

describe("createSupabaseBreed", () => {
  it("inserts breed with species_id mapping", async () => {
    mockFrom.mockReturnValue(makeChain({ data: null, error: null }));
    await createSupabaseBreed({ id: "br1", name: "Persa", speciesId: "sp1" });
    expect(mockFrom).toHaveBeenCalledWith("breeds");
  });
});

describe("deleteSupabaseBreed", () => {
  it("deletes breed row", async () => {
    mockFrom.mockReturnValue(makeChain({ data: null, error: null }));
    await deleteSupabaseBreed("br1");
    expect(mockFrom).toHaveBeenCalledWith("breeds");
  });
});

describe("createSupabaseSize", () => {
  it("inserts size row", async () => {
    mockFrom.mockReturnValue(makeChain({ data: null, error: null }));
    await createSupabaseSize({ id: "sz1", name: "Pequeno", slug: "pequeno" });
    expect(mockFrom).toHaveBeenCalledWith("sizes");
  });
});

describe("deleteSupabaseSize", () => {
  it("deletes size row", async () => {
    mockFrom.mockReturnValue(makeChain({ data: null, error: null }));
    await deleteSupabaseSize("sz1");
    expect(mockFrom).toHaveBeenCalledWith("sizes");
  });
});

const sampleAnimal = {
  id: "an1", name: "Rex", speciesId: "sp1", breedId: "br1", sizeId: "sz1",
  ageMonths: 12, sex: "Macho" as const, city: "SP", state: "SP",
  description: "Cachorro", status: "available" as const,
  imageUrl: "https://example.com/img.jpg", createdAt: "2024-01-01",
};

describe("createSupabaseAnimal", () => {
  it("maps camelCase to snake_case and inserts", async () => {
    mockFrom.mockReturnValue(makeChain({ data: null, error: null }));
    await createSupabaseAnimal(sampleAnimal);
    const chain = mockFrom.mock.results[0].value;
    expect(chain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ species_id: "sp1", breed_id: "br1", age_months: 12 }),
    );
  });
});

describe("updateSupabaseAnimal", () => {
  it("maps camelCase fields and calls update", async () => {
    mockFrom.mockReturnValue(makeChain({ data: null, error: null }));
    await updateSupabaseAnimal(sampleAnimal);
    expect(mockFrom).toHaveBeenCalledWith("animals");
  });
});

describe("deleteSupabaseAnimal", () => {
  it("deletes animal row", async () => {
    mockFrom.mockReturnValue(makeChain({ data: null, error: null }));
    await deleteSupabaseAnimal("an1");
    expect(mockFrom).toHaveBeenCalledWith("animals");
  });
});

describe("listUserSupabaseAdoptionRequests", () => {
  it("returns mapped adoption requests for user", async () => {
    const row = {
      id: "req1", animal_id: "an1", adopter_name: "Joao", email: "j@e.com",
      phone: "(11) 99999-1234", message: "Interesse", status: "received",
      created_at: "2024-01-01", user_id: "u1",
    };
    mockFrom.mockReturnValue(makeChain({ data: [row], error: null }));
    const result = await listUserSupabaseAdoptionRequests("u1");
    expect(result[0].adopterName).toBe("Joao");
    expect(result[0].animalId).toBe("an1");
  });

  it("throws on Supabase error", async () => {
    mockFrom.mockReturnValue(makeChain({ data: null, error: new Error("DB failure") }));
    await expect(listUserSupabaseAdoptionRequests("u1")).rejects.toThrow("DB failure");
  });
});

const sampleRequest = {
  id: "req1", animalId: "an1", adopterName: "Joao", email: "j@e.com",
  phone: "(11) 99999-1234", message: "Quero adotar", status: "received" as const,
  createdAt: "2024-01-01", userId: "u1",
};

describe("createSupabaseAdoptionRequest", () => {
  it("throws when animal is not found", async () => {
    mockFrom.mockReturnValueOnce(makeChain({ data: null, error: null }));
    await expect(createSupabaseAdoptionRequest(sampleRequest)).rejects.toThrow("Animal nao encontrado.");
  });

  it("throws when animal is already adopted", async () => {
    mockFrom.mockReturnValueOnce(makeChain({ data: { id: "an1", status: "adopted" }, error: null }));
    await expect(createSupabaseAdoptionRequest(sampleRequest)).rejects.toThrow("Este animal ja foi adotado.");
  });

  it("inserts request and updates animal to in_process when available", async () => {
    mockFrom
      .mockReturnValueOnce(makeChain({ data: { id: "an1", status: "available" }, error: null }))
      .mockReturnValueOnce(makeChain({ data: null, error: null }))
      .mockReturnValueOnce(makeChain({ data: null, error: null }));

    await expect(createSupabaseAdoptionRequest(sampleRequest)).resolves.toBeUndefined();
  });

  it("inserts request without status update when animal is in_process", async () => {
    mockFrom
      .mockReturnValueOnce(makeChain({ data: { id: "an1", status: "in_process" }, error: null }))
      .mockReturnValueOnce(makeChain({ data: null, error: null }));

    await expect(createSupabaseAdoptionRequest(sampleRequest)).resolves.toBeUndefined();
  });
});

describe("updateSupabaseAdoptionRequestStatus", () => {
  it("updates status and marks animal as adopted when approved", async () => {
    mockFrom
      .mockReturnValueOnce(makeChain({ data: { animal_id: "an1" }, error: null }))
      .mockReturnValueOnce(makeChain({ data: null, error: null }))
      .mockReturnValueOnce(makeChain({ data: null, error: null }));

    await updateSupabaseAdoptionRequestStatus("req1", "approved");
    expect(mockFrom).toHaveBeenCalledTimes(3);
  });

  it("marks animal as adopted when status is completed", async () => {
    mockFrom
      .mockReturnValueOnce(makeChain({ data: { animal_id: "an1" }, error: null }))
      .mockReturnValueOnce(makeChain({ data: null, error: null }))
      .mockReturnValueOnce(makeChain({ data: null, error: null }));

    await updateSupabaseAdoptionRequestStatus("req1", "completed");
    expect(mockFrom).toHaveBeenCalledTimes(3);
  });

  it("restores animal to available when rejected with no active requests", async () => {
    mockFrom
      .mockReturnValueOnce(makeChain({ data: { animal_id: "an1" }, error: null }))
      .mockReturnValueOnce(makeChain({ data: null, error: null }))
      .mockReturnValueOnce(makeChain({ data: [], error: null }))
      .mockReturnValueOnce(makeChain({ data: null, error: null }));

    await updateSupabaseAdoptionRequestStatus("req1", "rejected");
    expect(mockFrom).toHaveBeenCalledTimes(4);
  });

  it("does not restore animal when other active requests exist", async () => {
    mockFrom
      .mockReturnValueOnce(makeChain({ data: { animal_id: "an1" }, error: null }))
      .mockReturnValueOnce(makeChain({ data: null, error: null }))
      .mockReturnValueOnce(makeChain({ data: [{ id: "req2" }], error: null }));

    await updateSupabaseAdoptionRequestStatus("req1", "cancelled");
    expect(mockFrom).toHaveBeenCalledTimes(3);
  });

  it("does nothing when request not found", async () => {
    mockFrom
      .mockReturnValueOnce(makeChain({ data: null, error: null }))
      .mockReturnValueOnce(makeChain({ data: null, error: null }));

    await updateSupabaseAdoptionRequestStatus("req1", "reviewing");
    expect(mockFrom).toHaveBeenCalledTimes(2);
  });
});

describe("uploadAnimalImage", () => {
  it("throws when service role key is missing", async () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const file = new File(["img"], "cat.jpg", { type: "image/jpeg" });
    await expect(uploadAnimalImage(file)).rejects.toThrow("SUPABASE_SERVICE_ROLE_KEY");
  });

  it("throws when upload fails", async () => {
    mockUpload.mockResolvedValue({ error: { message: "Upload failed" } });
    const file = new File(["img"], "cat.jpg", { type: "image/jpeg" });
    await expect(uploadAnimalImage(file)).rejects.toThrow("Falha no upload da imagem: Upload failed");
  });

  it("returns public URL on success", async () => {
    mockUpload.mockResolvedValue({ error: null });
    mockGetPublicUrl.mockReturnValue({ data: { publicUrl: "https://cdn.example.com/cat.jpg" } });
    const file = new File(["img"], "cat.jpg", { type: "image/jpeg" });
    const url = await uploadAnimalImage(file);
    expect(url).toBe("https://cdn.example.com/cat.jpg");
  });
});
