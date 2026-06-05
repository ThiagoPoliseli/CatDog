"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { CalendarDays, Check, Filter, MapPin, Search, X } from "lucide-react";
import type { AnimalView, Breed, Size, Species } from "@/lib/types";
import { adoptionStatusLabels } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type User = {
  id: string;
  email: string;
  name: string;
};

type Props = {
  animals: AnimalView[];
  species: Species[];
  breeds: Breed[];
  sizes: Size[];
  user?: User | null;
};

type RequestState = {
  type: "idle" | "success" | "error";
  message: string;
};

function formatAge(months: number) {
  if (months < 12) {
    return `${months} meses`;
  }

  const years = Math.floor(months / 12);
  const rest = months % 12;
  return rest ? `${years} anos e ${rest} meses` : `${years} anos`;
}

type AdoptionStatusVariant = "available" | "in_process" | "adopted";

function statusVariant(status: string): AdoptionStatusVariant {
  if (status === "available" || status === "in_process" || status === "adopted") {
    return status as AdoptionStatusVariant;
  }
  return "adopted";
}

export function AnimalCatalog({ animals, species, breeds, sizes, user }: Props) {
  const [query, setQuery] = useState("");
  const [speciesId, setSpeciesId] = useState("");
  const [breedId, setBreedId] = useState("");
  const [sizeId, setSizeId] = useState("");
  const [status, setStatus] = useState("");
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalView | null>(null);
  const [requestState, setRequestState] = useState<RequestState>({
    type: "idle",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredBreeds = useMemo(() => {
    if (!speciesId) {
      return breeds;
    }

    return breeds.filter((breed) => breed.speciesId === speciesId);
  }, [breeds, speciesId]);

  const filteredAnimals = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return animals.filter((animal) => {
      const matchesQuery = normalizedQuery
        ? [
            animal.name,
            animal.city,
            animal.state,
            animal.speciesName,
            animal.breedName,
            animal.sizeName,
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery)
        : true;

      return (
        matchesQuery &&
        (!speciesId || animal.speciesId === speciesId) &&
        (!breedId || animal.breedId === breedId) &&
        (!sizeId || animal.sizeId === sizeId) &&
        (!status || animal.status === status)
      );
    });
  }, [animals, breedId, query, sizeId, speciesId, status]);

  function clearFilters() {
    setQuery("");
    setSpeciesId("");
    setBreedId("");
    setSizeId("");
    setStatus("");
  }

  async function submitRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedAnimal) {
      return;
    }

    const form = event.currentTarget;
    setIsSubmitting(true);
    setRequestState({ type: "idle", message: "" });

    const formData = new FormData(form);
    const payload = {
      animalId: selectedAnimal.id,
      adopterName: String(formData.get("adopterName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      message: String(formData.get("message") ?? ""),
    };

    const response = await fetch("/api/adoption-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = (await response.json()) as { message?: string };
    setIsSubmitting(false);

    if (!response.ok) {
      setRequestState({
        type: "error",
        message: result.message ?? "Nao foi possivel enviar a solicitacao.",
      });
      return;
    }

    setRequestState({
      type: "success",
      message: "Solicitacao enviada. A organizacao entrara em contato.",
    });
    form.reset();
  }

  return (
    <>
      <section className="toolbar" aria-label="Filtros de animais">
        <div className="grid gap-1.5">
          <Label className="text-muted-foreground text-xs">Busca</Label>
          <div className="relative">
            <Search
              aria-hidden
              size={18}
              className="absolute left-3 top-3 text-muted-foreground pointer-events-none"
            />
            <Input
              className="pl-9"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nome, cidade ou raca"
              value={query}
            />
          </div>
        </div>

        <div className="grid gap-1.5">
          <Label className="text-muted-foreground text-xs">Especie</Label>
          <Select
            onValueChange={(value) => {
              setSpeciesId(value === "all" ? "" : value);
              setBreedId("");
            }}
            value={speciesId || "all"}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {species.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <Label className="text-muted-foreground text-xs">Raca</Label>
          <Select
            onValueChange={(value) => setBreedId(value === "all" ? "" : value)}
            value={breedId || "all"}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {filteredBreeds.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <Label className="text-muted-foreground text-xs">Porte</Label>
          <Select
            onValueChange={(value) => setSizeId(value === "all" ? "" : value)}
            value={sizeId || "all"}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {sizes.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <Label className="text-muted-foreground text-xs">Status</Label>
          <Select
            onValueChange={(value) => setStatus(value === "all" ? "" : value)}
            value={status || "all"}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="available">Disponivel</SelectItem>
              <SelectItem value="in_process">Em processo</SelectItem>
              <SelectItem value="adopted">Adotado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button variant="outline" onClick={clearFilters} type="button">
            <Filter size={16} aria-hidden />
            Limpar
          </Button>
        </div>
      </section>

      {filteredAnimals.length ? (
        <section className="animal-grid" aria-live="polite">
          {filteredAnimals.map((animal) => (
            <article className="animal-card" key={animal.id}>
              <Image
                alt={`Foto de ${animal.name}`}
                height={420}
                sizes="(max-width: 640px) 100vw, (max-width: 1180px) 50vw, 280px"
                src={animal.imageUrl}
                width={560}
              />
              <div className="animal-card-body flex flex-col flex-1">
                <div className="animal-title">
                  <div>
                    <h2>{animal.name}</h2>
                    <p className="muted" style={{ margin: "4px 0 0" }}>
                      {animal.breedName}
                    </p>
                  </div>
                  <Badge variant={statusVariant(animal.status)}>
                    {adoptionStatusLabels[animal.status]}
                  </Badge>
                </div>

                <p className="muted" style={{ margin: 0 }}>
                  {animal.description}
                </p>

                <div className="meta">
                  <Badge variant="species">{animal.speciesName}</Badge>
                  <Badge variant="species">{animal.sizeName}</Badge>
                  <Badge variant="species">{animal.sex}</Badge>
                  <Badge variant="species">
                    <CalendarDays size={13} aria-hidden />
                    {formatAge(animal.ageMonths)}
                  </Badge>
                </div>

                <div className="meta">
                  <MapPin size={15} aria-hidden />
                  {animal.city} - {animal.state}
                </div>

                <Button
                  className="mt-auto"
                  disabled={animal.status === "adopted"}
                  onClick={() => {
                    setSelectedAnimal(animal);
                    setRequestState({ type: "idle", message: "" });
                  }}
                  type="button"
                >
                  <Check size={16} aria-hidden />
                  {animal.status === "adopted" ? "Ja adotado" : "Tenho interesse"}
                </Button>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <div className="empty">Nenhum animal encontrado com esses filtros.</div>
      )}

      {selectedAnimal ? (
        <div className="dialog-backdrop" role="presentation">
          <section
            aria-labelledby="request-title"
            aria-modal="true"
            className="dialog"
            role="dialog"
          >
            <header>
              <h2 id="request-title">Solicitar adocao de {selectedAnimal.name}</h2>
              <Button
                aria-label="Fechar"
                variant="outline"
                size="icon"
                onClick={() => setSelectedAnimal(null)}
                type="button"
              >
                <X size={16} aria-hidden />
              </Button>
            </header>

            {requestState.type !== "idle" ? (
              <Alert
                variant={requestState.type === "error" ? "destructive" : "success"}
                className="mb-3"
              >
                <AlertDescription>{requestState.message}</AlertDescription>
              </Alert>
            ) : null}

            <form className="form-grid" onSubmit={submitRequest}>
              <div className="grid gap-1.5">
                <Label htmlFor="adopterName">Nome</Label>
                <Input
                  id="adopterName"
                  name="adopterName"
                  required
                  defaultValue={user?.name ?? ""}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  required
                  type="email"
                  defaultValue={user?.email ?? ""}
                />
              </div>
              <div className="grid gap-1.5 full">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" name="phone" required />
              </div>
              <div className="grid gap-1.5 full">
                <Label htmlFor="message">Mensagem</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Conte por que voce quer adotar este animal."
                  required
                />
              </div>
              <div className="actions full">
                <Button disabled={isSubmitting} type="submit">
                  {isSubmitting ? "Enviando..." : "Enviar solicitacao"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedAnimal(null)}
                  type="button"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}
