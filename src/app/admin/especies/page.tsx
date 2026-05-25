import { listCatalog } from "@/lib/store";
import { createSpeciesAction, deleteSpeciesAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminSpeciesPage() {
  const catalog = await listCatalog();

  return (
    <>
      <div className="section-title">
        <div>
          <h1>Especies</h1>
          <p className="muted">Gerencie especies usadas no cadastro.</p>
        </div>
      </div>

      <section className="panel">
        <form action={createSpeciesAction} className="form-grid">
          <label>
            <span className="muted">Nome da especie</span>
            <input className="field" name="name" required />
          </label>
          <button className="button" type="submit">
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
                <th>Slug</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {catalog.species.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.slug}</td>
                  <td>
                    <form action={deleteSpeciesAction}>
                      <input name="id" type="hidden" value={item.id} />
                      <button className="button danger" type="submit">
                        Remover
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
