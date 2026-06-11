export type AdoptionStatus = "available" | "in_process" | "adopted";
export type RequestStatus =
  | "received"
  | "reviewing"
  | "approved"
  | "rejected"
  | "completed"
  | "cancelled";
export type AnimalSex = "Macho" | "Femea";

export type Species = {
  id: string;
  name: string;
  slug: string;
};

export type Breed = {
  id: string;
  name: string;
  speciesId: string;
};

export type Size = {
  id: string;
  name: string;
  slug: string;
};

export type Animal = {
  id: string;
  name: string;
  speciesId: string;
  breedId: string;
  sizeId: string;
  ageMonths: number;
  sex: AnimalSex;
  city: string;
  state: string;
  description: string;
  status: AdoptionStatus;
  imageUrl: string;
  createdAt: string;
};

export type AdoptionRequest = {
  id: string;
  animalId: string;
  adopterName: string;
  email: string;
  phone: string;
  message: string;
  status: RequestStatus;
  createdAt: string;
  userId?: string;
};

export type CatDogDatabase = {
  species: Species[];
  breeds: Breed[];
  sizes: Size[];
  animals: Animal[];
  adoptionRequests: AdoptionRequest[];
};

export type AnimalView = Animal & {
  speciesName: string;
  breedName: string;
  sizeName: string;
};

export const adoptionStatusLabels: Record<AdoptionStatus, string> = {
  available: "Disponivel",
  in_process: "Em processo",
  adopted: "Adotado",
};

export const requestStatusLabels: Record<RequestStatus, string> = {
  received: "Recebida",
  reviewing: "Em analise",
  approved: "Aprovada",
  rejected: "Recusada",
  completed: "Concluida",
  cancelled: "Cancelada",
};
