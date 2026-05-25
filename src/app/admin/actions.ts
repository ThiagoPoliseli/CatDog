"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { signOut } from "@/lib/auth";
import {
  createAnimal,
  createBreed,
  createSize,
  createSpecies,
  deleteAnimal,
  deleteBreed,
  deleteSize,
  deleteSpecies,
  updateAdoptionRequestStatus,
  updateAnimal,
} from "@/lib/store";
import {
  animalSchema,
  breedSchema,
  requestStatusSchema,
  sizeSchema,
  slugify,
  speciesSchema,
} from "@/lib/validation";

function revalidateAdmin() {
  revalidatePath("/animais");
  revalidatePath("/admin");
  revalidatePath("/admin/animais");
  revalidatePath("/admin/especies");
  revalidatePath("/admin/racas");
  revalidatePath("/admin/portes");
  revalidatePath("/admin/solicitacoes");
}

export async function logoutAction() {
  await signOut();
  redirect("/animais");
}

export async function createSpeciesAction(formData: FormData) {
  const parsed = speciesSchema.parse({
    name: formData.get("name"),
  });
  await createSpecies({ name: parsed.name, slug: slugify(parsed.name) });
  revalidateAdmin();
}

export async function deleteSpeciesAction(formData: FormData) {
  await deleteSpecies(String(formData.get("id") ?? ""));
  revalidateAdmin();
}

export async function createBreedAction(formData: FormData) {
  const parsed = breedSchema.parse({
    name: formData.get("name"),
    speciesId: formData.get("speciesId"),
  });
  await createBreed(parsed);
  revalidateAdmin();
}

export async function deleteBreedAction(formData: FormData) {
  await deleteBreed(String(formData.get("id") ?? ""));
  revalidateAdmin();
}

export async function createSizeAction(formData: FormData) {
  const parsed = sizeSchema.parse({
    name: formData.get("name"),
  });
  await createSize({ name: parsed.name, slug: slugify(parsed.name) });
  revalidateAdmin();
}

export async function deleteSizeAction(formData: FormData) {
  await deleteSize(String(formData.get("id") ?? ""));
  revalidateAdmin();
}

export async function createAnimalAction(formData: FormData) {
  const parsed = animalSchema.parse({
    name: formData.get("name"),
    speciesId: formData.get("speciesId"),
    breedId: formData.get("breedId"),
    sizeId: formData.get("sizeId"),
    ageMonths: formData.get("ageMonths"),
    sex: formData.get("sex"),
    city: formData.get("city"),
    state: formData.get("state"),
    description: formData.get("description"),
    status: formData.get("status"),
    imageUrl: formData.get("imageUrl"),
  });

  await createAnimal({
    ...parsed,
    state: parsed.state.toUpperCase(),
  });
  revalidateAdmin();
}

export async function updateAnimalAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const parsed = animalSchema.parse({
    name: formData.get("name"),
    speciesId: formData.get("speciesId"),
    breedId: formData.get("breedId"),
    sizeId: formData.get("sizeId"),
    ageMonths: formData.get("ageMonths"),
    sex: formData.get("sex"),
    city: formData.get("city"),
    state: formData.get("state"),
    description: formData.get("description"),
    status: formData.get("status"),
    imageUrl: formData.get("imageUrl"),
  });

  await updateAnimal(id, {
    ...parsed,
    state: parsed.state.toUpperCase(),
  });
  revalidateAdmin();
}

export async function deleteAnimalAction(formData: FormData) {
  await deleteAnimal(String(formData.get("id") ?? ""));
  revalidateAdmin();
}

export async function updateRequestStatusAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const parsed = requestStatusSchema.parse({
    status: formData.get("status"),
  });
  await updateAdoptionRequestStatus(id, parsed.status);
  revalidateAdmin();
}
