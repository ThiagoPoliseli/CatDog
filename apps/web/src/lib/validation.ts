import { z } from "zod";

export const speciesSchema = z.object({
  name: z.string().trim().min(2, "Informe uma especie valida."),
});

export const sizeSchema = z.object({
  name: z.string().trim().min(2, "Informe um porte valido."),
});

export const breedSchema = z.object({
  name: z.string().trim().min(2, "Informe uma raca valida."),
  speciesId: z.string().trim().min(1, "Selecione a especie."),
});

export const animalSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do animal."),
  speciesId: z.string().trim().min(1, "Selecione a especie."),
  breedId: z.string().trim().min(1, "Selecione a raca."),
  sizeId: z.string().trim().min(1, "Selecione o porte."),
  ageMonths: z.coerce.number().int().min(0, "A idade nao pode ser negativa."),
  sex: z.enum(["Macho", "Femea"]),
  city: z.string().trim().min(2, "Informe a cidade."),
  state: z.string().trim().min(2, "Informe o estado.").max(2, "Use a sigla do estado."),
  description: z.string().trim().min(10, "Informe uma descricao mais completa."),
  status: z.enum(["available", "in_process", "adopted"]),
  imageUrl: z.string().trim().url("Informe uma URL valida para imagem."),
});

export const adoptionRequestSchema = z.object({
  animalId: z.string().trim().min(1, "Selecione o animal."),
  adopterName: z.string().trim().min(2, "Informe seu nome."),
  email: z.string().trim().email("Informe um e-mail valido."),
  phone: z
    .string()
    .trim()
    .refine(
      (val) => /^\(\d{2}\)\s?\d{4,5}-\d{4}$/.test(val),
      "Informe o telefone no formato (XX) XXXX-XXXX.",
    ),
  message: z.string().trim().min(10, "Conte um pouco sobre seu interesse."),
});

export const requestStatusSchema = z.object({
  status: z.enum(["received", "reviewing", "approved", "rejected", "completed"]),
});

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
