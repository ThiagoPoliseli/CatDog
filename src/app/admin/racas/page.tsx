import { listCatalog } from "@/lib/store";
import { createBreedAction, deleteBreedAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminBreedsPage() {
  const catalog = await listCatalog();

  return (
    <>
      <div className="section-title">
        <div>
          <h1>Racas</h1>
          <p className="muted">Gerencie racas vinculadas a especies.</p>
        </div>
      </div>

      <section className="panel">
        <form action={createBreedAction} className="form-grid">
          <label>
            <span className="muted">Nome da raca</span>
            <input className="field" name="name" required />
          </label>
          <label>
            <span className="muted">Especie</span>
            <select className="select" name="speciesId" required>
              <option value="">Selecione</option>
              {catalog.species.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <button className="button full" type="submit">
            Adicionar
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Especie</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {catalog.breeds.map((item) => {
                const species = catalog.species.find(
                  (speciesItem) => speciesItem.id === item.speciesId,
                );
                return (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{species?.name ?? "Nao identificada"}</td>
                    <td>
                      <form action={deleteBreedAction}>
                        <input name="id" type="hidden" value={item.id} />
                        <button className="button danger" type="submit">
                          Remover
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
