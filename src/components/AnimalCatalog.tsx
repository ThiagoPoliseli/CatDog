"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { CalendarDays, Check, Filter, MapPin, Search, X } from "lucide-react";
import type { AnimalView, Breed, Size, Species } from "@/lib/types";
import { adoptionStatusLabels } from "@/lib/types";

type Props = {
  animals: AnimalView[];
  species: Species[];
  breeds: Breed[];
  sizes: Size[];
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

export function AnimalCatalog({ animals, species, breeds, sizes }: Props) {
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

    setIsSubmitting(true);
    setRequestState({ type: "idle", message: "" });

    const formData = new FormData(event.currentTarget);
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
    event.currentTarget.reset();
  }

  return (
    <>
      <section className="toolbar" aria-label="Filtros de animais">
        <label>
          <span className="muted">Busca</span>
          <div style={{ position: "relative" }}>
            <Search
              aria-hidden
              size={18}
              style={{ left: 12, position: "absolute", top: 13 }}
            />
            <input
              className="field"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nome, cidade ou raca"
              style={{ paddingLeft: 38 }}
              value={query}
            />
          </div>
        </label>

        <label>
          <span className="muted">Especie</span>
          <select
            className="select"
            onChange={(event) => {
              setSpeciesId(event.target.value);
              setBreedId("");
            }}
            value={speciesId}
          >
            <option value="">Todas</option>
            {species.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="muted">Raca</span>
          <select
            className="select"
            onChange={(event) => setBreedId(event.target.value)}
            value={breedId}
          >
            <option value="">Todas</option>
            {filteredBreeds.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="muted">Porte</span>
          <select
            className="select"
            onChange={(event) => setSizeId(event.target.value)}
            value={sizeId}
          >
            <option value="">Todos</option>
            {sizes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="muted">Status</span>
          <select
            className="select"
            onChange={(event) => setStatus(event.target.value)}
            value={status}
          >
            <option value="">Todos</option>
            <option value="available">Disponivel</option>
            <option value="in_process">Em processo</option>
            <option value="adopted">Adotado</option>
          </select>
        </label>

        <button className="button secondary" onClick={clearFilters} type="button">
          <Filter size={16} aria-hidden />
          Limpar
        </button>
      </section>

      {filteredAnimals.length ? (
        <section className="grid" aria-live="polite">
          {filteredAnimals.map((animal) => (
            <article className="animal-card" key={animal.id}>
              <Image
                alt={`Foto de ${animal.name}`}
                height={420}
                sizes="(max-width: 640px) 100vw, (max-width: 1180px) 50vw, 280px"
                src={animal.imageUrl}
                width={560}
              />
              <div className="animal-card-body">
                <div className="animal-title">
                  <div>
                    <h2>{animal.name}</h2>
                    <p className="muted" style={{ margin: "4px 0 0" }}>
                      {animal.breedName}
                    </p>
                  </div>
                  <span className={`pill ${animal.status}`}>
                    {adoptionStatusLabels[animal.status]}
                  </span>
                </div>

                <p className="muted" style={{ margin: 0 }}>
                  {animal.description}
                </p>

                <div className="meta">
                  <span className="pill">{animal.speciesName}</span>
                  <span className="pill">{animal.sizeName}</span>
                  <span className="pill">{animal.sex}</span>
                  <span className="pill">
                    <CalendarDays size={13} aria-hidden />
                    {formatAge(animal.ageMonths)}
                  </span>
                </div>

                <div className="meta">
                  <MapPin size={15} aria-hidden />
                  {animal.city} - {animal.state}
                </div>

                <button
                  className="button"
                  disabled={animal.status === "adopted"}
                  onClick={() => {
                    setSelectedAnimal(animal);
                    setRequestState({ type: "idle", message: "" });
                  }}
                  type="button"
                >
                  <Check size={16} aria-hidden />
                  {animal.status === "adopted" ? "Ja adotado" : "Tenho interesse"}
                </button>
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
              <button
                aria-label="Fechar"
                className="button secondary"
                onClick={() => setSelectedAnimal(null)}
                type="button"
              >
                <X size={16} aria-hidden />
              </button>
            </header>

            {requestState.type !== "idle" ? (
              <div className={`message ${requestState.type}`}>
                {requestState.message}
              </div>
            ) : null}

            <form className="form-grid" onSubmit={submitRequest}>
              <label>
                <span className="muted">Nome</span>
                <input className="field" name="adopterName" required />
              </label>
              <label>
                <span className="muted">E-mail</span>
                <input className="field" name="email" required type="email" />
              </label>
              <label className="full">
                <span className="muted">Telefone</span>
                <input className="field" name="phone" required />
              </label>
              <label className="full">
                <span className="muted">Mensagem</span>
                <textarea
                  className="textarea"
                  name="message"
                  placeholder="Conte por que voce quer adotar este animal."
                  required
                />
              </label>
              <div className="actions full">
                <button className="button" disabled={isSubmitting} type="submit">
                  {isSubmitting ? "Enviando..." : "Enviar solicitacao"}
                </button>
                <button
                  className="button secondary"
                  onClick={() => setSelectedAnimal(null)}
                  type="button"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}
