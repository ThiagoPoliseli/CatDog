import type { AnimalView, Breed, Size, Species } from "@/lib/types";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  animals?: AnimalView;
  breeds: Breed[];
  sizes: Size[];
  species: Species[];
};

export function AnimalAdminForm({
  action,
  animals,
  breeds,
  sizes,
  species,
}: Props) {
  return (
    <form action={action} className="form-grid">
      {animals ? <input name="id" type="hidden" value={animals.id} /> : null}
      <label>
        <span className="muted">Nome</span>
        <input
          className="field"
          defaultValue={animals?.name}
          name="name"
          required
        />
      </label>
      <label>
        <span className="muted">Imagem</span>
        <input
          className="field"
          defaultValue={animals?.imageUrl}
          name="imageUrl"
          required
          type="url"
        />
      </label>
      <label>
        <span className="muted">Especie</span>
        <select
          className="select"
          defaultValue={animals?.speciesId}
          name="speciesId"
          required
        >
          <option value="">Selecione</option>
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
          defaultValue={animals?.breedId}
          name="breedId"
          required
        >
          <option value="">Selecione</option>
          {breeds.map((item) => (
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
          defaultValue={animals?.sizeId}
          name="sizeId"
          required
        >
          <option value="">Selecione</option>
          {sizes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="muted">Idade em meses</span>
        <input
          className="field"
          defaultValue={animals?.ageMonths ?? 0}
          min={0}
          name="ageMonths"
          required
          type="number"
        />
      </label>
      <label>
        <span className="muted">Sexo</span>
        <select
          className="select"
          defaultValue={animals?.sex ?? "Macho"}
          name="sex"
          required
        >
          <option value="Macho">Macho</option>
          <option value="Femea">Femea</option>
        </select>
      </label>
      <label>
        <span className="muted">Status</span>
        <select
          className="select"
          defaultValue={animals?.status ?? "available"}
          name="status"
          required
        >
          <option value="available">Disponivel</option>
          <option value="in_process">Em processo</option>
          <option value="adopted">Adotado</option>
        </select>
      </label>
      <label>
        <span className="muted">Cidade</span>
        <input
          className="field"
          defaultValue={animals?.city}
          name="city"
          required
        />
      </label>
      <label>
        <span className="muted">Estado</span>
        <input
          className="field"
          defaultValue={animals?.state}
          maxLength={2}
          name="state"
          required
        />
      </label>
      <label className="full">
        <span className="muted">Descricao</span>
        <textarea
          className="textarea"
          defaultValue={animals?.description}
          name="description"
          required
        />
      </label>
      <button className="button full" type="submit">
        {animals ? "Salvar alteracoes" : "Cadastrar animal"}
      </button>
    </form>
  );
}
