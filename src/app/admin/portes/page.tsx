import { listCatalog } from "@/lib/store";
import { createSizeAction, deleteSizeAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminSizesPage() {
  const catalog = await listCatalog();

  return (
    <>
      <div className="section-title">
        <div>
          <h1>Portes</h1>
          <p className="muted">Gerencie os tamanhos dos animais.</p>
        </div>
      </div>

      <section className="panel">
        <form action={createSizeAction} className="form-grid">
          <label>
            <span className="muted">Nome do porte</span>
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
              {catalog.sizes.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.slug}</td>
                  <td>
                    <form action={deleteSizeAction}>
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
