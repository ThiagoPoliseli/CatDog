import { describe, it, expect } from "vitest";
import {
  speciesSchema,
  sizeSchema,
  breedSchema,
  animalSchema,
  adoptionRequestSchema,
  requestStatusSchema,
  slugify,
} from "./validation";

describe("speciesSchema", () => {
  it("accepts valid name", () => {
    expect(speciesSchema.safeParse({ name: "Gato" }).success).toBe(true);
  });
  it("trims whitespace", () => {
    const r = speciesSchema.safeParse({ name: "  Cao  " });
    expect(r.success && r.data.name).toBe("Cao");
  });
  it("rejects name with 1 char", () => {
    expect(speciesSchema.safeParse({ name: "A" }).success).toBe(false);
  });
  it("rejects empty name", () => {
    expect(speciesSchema.safeParse({ name: "" }).success).toBe(false);
  });
});

describe("sizeSchema", () => {
  it("accepts valid size name", () => {
    expect(sizeSchema.safeParse({ name: "Pequeno" }).success).toBe(true);
  });
  it("rejects name with 1 char", () => {
    expect(sizeSchema.safeParse({ name: "P" }).success).toBe(false);
  });
  it("rejects empty name", () => {
    expect(sizeSchema.safeParse({ name: "" }).success).toBe(false);
  });
});

describe("breedSchema", () => {
  it("accepts valid breed with speciesId", () => {
    expect(breedSchema.safeParse({ name: "Labrador", speciesId: "abc" }).success).toBe(true);
  });
  it("rejects empty speciesId", () => {
    expect(breedSchema.safeParse({ name: "Labrador", speciesId: "" }).success).toBe(false);
  });
  it("rejects short name", () => {
    expect(breedSchema.safeParse({ name: "L", speciesId: "abc" }).success).toBe(false);
  });
});

describe("animalSchema", () => {
  const valid = {
    name: "Rex",
    speciesId: "s1",
    breedId: "b1",
    sizeId: "sz1",
    ageMonths: 12,
    sex: "Macho",
    city: "Sao Paulo",
    state: "SP",
    description: "Um cao muito amigavel e brincalhao",
    status: "available",
    imageUrl: "https://example.com/image.jpg",
  };

  it("accepts valid animal data", () => {
    expect(animalSchema.safeParse(valid).success).toBe(true);
  });
  it("accepts sex Femea", () => {
    expect(animalSchema.safeParse({ ...valid, sex: "Femea" }).success).toBe(true);
  });
  it("accepts all valid statuses", () => {
    for (const status of ["available", "in_process", "adopted"]) {
      expect(animalSchema.safeParse({ ...valid, status }).success).toBe(true);
    }
  });
  it("coerces ageMonths string to number", () => {
    const r = animalSchema.safeParse({ ...valid, ageMonths: "6" });
    expect(r.success && r.data.ageMonths).toBe(6);
  });
  it("rejects ageMonths below 0", () => {
    expect(animalSchema.safeParse({ ...valid, ageMonths: -1 }).success).toBe(false);
  });
  it("rejects state longer than 2 chars", () => {
    expect(animalSchema.safeParse({ ...valid, state: "SAO" }).success).toBe(false);
  });
  it("rejects state shorter than 2 chars", () => {
    expect(animalSchema.safeParse({ ...valid, state: "S" }).success).toBe(false);
  });
  it("rejects invalid sex value", () => {
    expect(animalSchema.safeParse({ ...valid, sex: "Outro" }).success).toBe(false);
  });
  it("rejects invalid status value", () => {
    expect(animalSchema.safeParse({ ...valid, status: "unknown" }).success).toBe(false);
  });
  it("rejects invalid imageUrl", () => {
    expect(animalSchema.safeParse({ ...valid, imageUrl: "not-a-url" }).success).toBe(false);
  });
  it("rejects description shorter than 10 chars", () => {
    expect(animalSchema.safeParse({ ...valid, description: "Curto" }).success).toBe(false);
  });
  it("rejects city shorter than 2 chars", () => {
    expect(animalSchema.safeParse({ ...valid, city: "A" }).success).toBe(false);
  });
  it("rejects name shorter than 2 chars", () => {
    expect(animalSchema.safeParse({ ...valid, name: "R" }).success).toBe(false);
  });
});

describe("adoptionRequestSchema", () => {
  const valid = {
    animalId: "a1",
    adopterName: "Joao Silva",
    email: "joao@example.com",
    phone: "(11) 99999-1234",
    message: "Adoro animais e tenho espaco em casa",
  };

  it("accepts valid adoption request", () => {
    expect(adoptionRequestSchema.safeParse(valid).success).toBe(true);
  });
  it("accepts phone with 8-digit number (XX) XXXX-XXXX", () => {
    expect(adoptionRequestSchema.safeParse({ ...valid, phone: "(11) 3333-4444" }).success).toBe(true);
  });
  it("rejects phone without parentheses", () => {
    expect(adoptionRequestSchema.safeParse({ ...valid, phone: "11999991234" }).success).toBe(false);
  });
  it("rejects phone with wrong format", () => {
    expect(adoptionRequestSchema.safeParse({ ...valid, phone: "11-99999-1234" }).success).toBe(false);
  });
  it("rejects invalid email", () => {
    expect(adoptionRequestSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false);
  });
  it("rejects message shorter than 10 chars", () => {
    expect(adoptionRequestSchema.safeParse({ ...valid, message: "Curto" }).success).toBe(false);
  });
  it("rejects empty animalId", () => {
    expect(adoptionRequestSchema.safeParse({ ...valid, animalId: "" }).success).toBe(false);
  });
  it("rejects adopter name shorter than 2 chars", () => {
    expect(adoptionRequestSchema.safeParse({ ...valid, adopterName: "A" }).success).toBe(false);
  });
});

describe("requestStatusSchema", () => {
  const validStatuses = ["received", "reviewing", "approved", "rejected", "completed"];

  it.each(validStatuses)("accepts status '%s'", (status) => {
    expect(requestStatusSchema.safeParse({ status }).success).toBe(true);
  });

  it("rejects unknown status 'cancelled'", () => {
    expect(requestStatusSchema.safeParse({ status: "cancelled" }).success).toBe(false);
  });
  it("rejects empty status", () => {
    expect(requestStatusSchema.safeParse({ status: "" }).success).toBe(false);
  });
});

describe("slugify", () => {
  it("converts spaces to hyphens and lowercases", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });
  it("removes diacritics/accents", () => {
    expect(slugify("Ação")).toBe("acao");
  });
  it("handles full Portuguese text", () => {
    expect(slugify("São Paulo")).toBe("sao-paulo");
  });
  it("collapses consecutive separators", () => {
    expect(slugify("foo  --  bar")).toBe("foo-bar");
  });
  it("strips leading and trailing hyphens", () => {
    expect(slugify("-foo bar-")).toBe("foo-bar");
  });
  it("preserves numbers", () => {
    expect(slugify("Animal 123")).toBe("animal-123");
  });
  it("removes special characters except hyphens", () => {
    expect(slugify("Nome (Especial)!")).toBe("nome-especial");
  });
  it("handles already-lowercase ascii", () => {
    expect(slugify("labrador")).toBe("labrador");
  });
});
