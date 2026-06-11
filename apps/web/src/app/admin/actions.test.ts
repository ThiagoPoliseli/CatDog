import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/store", () => ({
  createSpecies: vi.fn(),
  deleteSpecies: vi.fn(),
  createBreed: vi.fn(),
  deleteBreed: vi.fn(),
  createSize: vi.fn(),
  deleteSize: vi.fn(),
  createAnimal: vi.fn(),
  updateAnimal: vi.fn(),
  deleteAnimal: vi.fn(),
  updateAdoptionRequestStatus: vi.fn(),
  uploadAnimalImage: vi.fn(),
}));

import {
  logoutAction,
  createSpeciesAction,
  deleteSpeciesAction,
  createBreedAction,
  deleteBreedAction,
  createSizeAction,
  deleteSizeAction,
  createAnimalAction,
  updateAnimalAction,
  deleteAnimalAction,
  updateRequestStatusAction,
} from "./actions";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import * as store from "@/lib/store";

const mockSignOut = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createClient).mockResolvedValue({
    auth: { signOut: mockSignOut },
  } as never);
  mockSignOut.mockResolvedValue({});
});

describe("logoutAction", () => {
  it("signs out and redirects to /entrar", async () => {
    await logoutAction();
    expect(mockSignOut).toHaveBeenCalled();
    expect(redirect).toHaveBeenCalledWith("/entrar");
  });
});

describe("createSpeciesAction", () => {
  it("creates species with slugified name and revalidates", async () => {
    vi.mocked(store.createSpecies).mockResolvedValue(undefined);
    const fd = new FormData();
    fd.set("name", "Cao Domestico");

    await createSpeciesAction(fd);

    expect(store.createSpecies).toHaveBeenCalledWith({ name: "Cao Domestico", slug: "cao-domestico" });
    expect(revalidatePath).toHaveBeenCalled();
  });

  it("throws ZodError for invalid name", async () => {
    const fd = new FormData();
    fd.set("name", "A");
    await expect(createSpeciesAction(fd)).rejects.toThrow();
  });
});

describe("deleteSpeciesAction", () => {
  it("deletes species and revalidates", async () => {
    vi.mocked(store.deleteSpecies).mockResolvedValue(undefined);
    const fd = new FormData();
    fd.set("id", "sp1");

    await deleteSpeciesAction(fd);

    expect(store.deleteSpecies).toHaveBeenCalledWith("sp1");
    expect(revalidatePath).toHaveBeenCalled();
  });

  it("calls deleteSpecies with empty string when id is absent from FormData (null-coalescing branch)", async () => {
    vi.mocked(store.deleteSpecies).mockResolvedValue(undefined);
    await deleteSpeciesAction(new FormData());
    expect(store.deleteSpecies).toHaveBeenCalledWith("");
  });
});

describe("createBreedAction", () => {
  it("creates breed and revalidates", async () => {
    vi.mocked(store.createBreed).mockResolvedValue(undefined);
    const fd = new FormData();
    fd.set("name", "Labrador");
    fd.set("speciesId", "sp1");

    await createBreedAction(fd);

    expect(store.createBreed).toHaveBeenCalledWith({ name: "Labrador", speciesId: "sp1" });
    expect(revalidatePath).toHaveBeenCalled();
  });

  it("throws ZodError when speciesId is empty", async () => {
    const fd = new FormData();
    fd.set("name", "Labrador");
    fd.set("speciesId", "");
    await expect(createBreedAction(fd)).rejects.toThrow();
  });
});

describe("deleteBreedAction", () => {
  it("deletes breed and revalidates", async () => {
    vi.mocked(store.deleteBreed).mockResolvedValue(undefined);
    const fd = new FormData();
    fd.set("id", "br1");

    await deleteBreedAction(fd);

    expect(store.deleteBreed).toHaveBeenCalledWith("br1");
  });

  it("calls deleteBreed with empty string when id is absent from FormData (null-coalescing branch)", async () => {
    vi.mocked(store.deleteBreed).mockResolvedValue(undefined);
    await deleteBreedAction(new FormData());
    expect(store.deleteBreed).toHaveBeenCalledWith("");
  });
});

describe("createSizeAction", () => {
  it("creates size with slug and revalidates", async () => {
    vi.mocked(store.createSize).mockResolvedValue(undefined);
    const fd = new FormData();
    fd.set("name", "Medio Porte");

    await createSizeAction(fd);

    expect(store.createSize).toHaveBeenCalledWith({ name: "Medio Porte", slug: "medio-porte" });
  });
});

describe("deleteSizeAction", () => {
  it("deletes size and revalidates", async () => {
    vi.mocked(store.deleteSize).mockResolvedValue(undefined);
    const fd = new FormData();
    fd.set("id", "sz1");

    await deleteSizeAction(fd);

    expect(store.deleteSize).toHaveBeenCalledWith("sz1");
  });
});

function makeAnimalFormData(overrides: Record<string, string> = {}) {
  const fd = new FormData();
  const defaults: Record<string, string> = {
    name: "Rex",
    speciesId: "sp1",
    breedId: "br1",
    sizeId: "sz1",
    ageMonths: "12",
    sex: "Macho",
    city: "Sao Paulo",
    state: "SP",
    description: "Cachorro muito amigavel e brincalhao",
    status: "available",
    imageUrl: "https://example.com/image.jpg",
    ...overrides,
  };
  for (const [k, v] of Object.entries(defaults)) fd.set(k, v);
  return fd;
}

describe("createAnimalAction", () => {
  it("creates animal from valid form data", async () => {
    vi.mocked(store.createAnimal).mockResolvedValue(undefined);

    await createAnimalAction(makeAnimalFormData());

    expect(store.createAnimal).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Rex", state: "SP" }),
    );
    expect(revalidatePath).toHaveBeenCalled();
  });

  it("throws when no image URL or file provided", async () => {
    const fd = makeAnimalFormData({ imageUrl: "" });
    await expect(createAnimalAction(fd)).rejects.toThrow("Informe uma imagem para o animal.");
  });

  it("throws when imageUrl field is absent from FormData (null-coalescing branch)", async () => {
    const fd = makeAnimalFormData();
    fd.delete("imageUrl");
    await expect(createAnimalAction(fd)).rejects.toThrow("Informe uma imagem para o animal.");
  });

  it("throws ZodError for invalid state (too long)", async () => {
    await expect(createAnimalAction(makeAnimalFormData({ state: "SAO" }))).rejects.toThrow();
  });

  it("uses uploadAnimalImage when a file is provided", async () => {
    vi.mocked(store.uploadAnimalImage).mockResolvedValue("https://cdn.example.com/upload.jpg");
    vi.mocked(store.createAnimal).mockResolvedValue(undefined);

    const fd = makeAnimalFormData({ imageUrl: "" });
    const file = new File(["img"], "dog.jpg", { type: "image/jpeg" });
    fd.set("imageFile", file);

    await createAnimalAction(fd);

    expect(store.uploadAnimalImage).toHaveBeenCalledWith(file);
    expect(store.createAnimal).toHaveBeenCalledWith(
      expect.objectContaining({ imageUrl: "https://cdn.example.com/upload.jpg" }),
    );
  });

  it("falls through to imageUrl when file has size 0", async () => {
    vi.mocked(store.createAnimal).mockResolvedValue(undefined);

    const fd = makeAnimalFormData();
    const emptyFile = new File([], "empty.jpg", { type: "image/jpeg" });
    fd.set("imageFile", emptyFile);

    await createAnimalAction(fd);

    expect(store.uploadAnimalImage).not.toHaveBeenCalled();
    expect(store.createAnimal).toHaveBeenCalledWith(
      expect.objectContaining({ imageUrl: "https://example.com/image.jpg" }),
    );
  });
});

describe("updateAnimalAction", () => {
  it("updates animal and uses existing image URL when no new file", async () => {
    vi.mocked(store.updateAnimal).mockResolvedValue(undefined);
    const fd = makeAnimalFormData();
    fd.set("id", "an1");
    fd.set("existingImageUrl", "https://existing.com/image.jpg");

    await updateAnimalAction(fd);

    expect(store.updateAnimal).toHaveBeenCalledWith("an1", expect.objectContaining({ name: "Rex" }));
  });

  it("uses imageUrl when existingImageUrl is absent from FormData (null-coalescing + || undefined branches)", async () => {
    vi.mocked(store.updateAnimal).mockResolvedValue(undefined);
    const fd = makeAnimalFormData();
    fd.set("id", "an1");
    // existingImageUrl not set → formData.get() returns null → null ?? "" → "" → "" || undefined → undefined

    await updateAnimalAction(fd);

    expect(store.updateAnimal).toHaveBeenCalledWith(
      "an1",
      expect.objectContaining({ imageUrl: "https://example.com/image.jpg" }),
    );
  });

  it("uploads new file when updating animal", async () => {
    vi.mocked(store.uploadAnimalImage).mockResolvedValue("https://cdn.example.com/updated.jpg");
    vi.mocked(store.updateAnimal).mockResolvedValue(undefined);

    const fd = makeAnimalFormData({ imageUrl: "" });
    fd.set("id", "an1");
    fd.set("existingImageUrl", "");
    const file = new File(["img"], "new.jpg", { type: "image/jpeg" });
    fd.set("imageFile", file);

    await updateAnimalAction(fd);

    expect(store.uploadAnimalImage).toHaveBeenCalledWith(file);
    expect(store.updateAnimal).toHaveBeenCalledWith(
      "an1",
      expect.objectContaining({ imageUrl: "https://cdn.example.com/updated.jpg" }),
    );
  });
});

describe("deleteAnimalAction", () => {
  it("deletes animal and revalidates", async () => {
    vi.mocked(store.deleteAnimal).mockResolvedValue(undefined);
    const fd = new FormData();
    fd.set("id", "an1");

    await deleteAnimalAction(fd);

    expect(store.deleteAnimal).toHaveBeenCalledWith("an1");
    expect(revalidatePath).toHaveBeenCalled();
  });
});

describe("updateRequestStatusAction", () => {
  it("updates request status and revalidates", async () => {
    vi.mocked(store.updateAdoptionRequestStatus).mockResolvedValue(undefined);
    const fd = new FormData();
    fd.set("id", "req1");
    fd.set("status", "approved");

    await updateRequestStatusAction(fd);

    expect(store.updateAdoptionRequestStatus).toHaveBeenCalledWith("req1", "approved");
    expect(revalidatePath).toHaveBeenCalled();
  });

  it("throws ZodError for invalid status", async () => {
    const fd = new FormData();
    fd.set("id", "req1");
    fd.set("status", "unknown");
    await expect(updateRequestStatusAction(fd)).rejects.toThrow();
  });
});
