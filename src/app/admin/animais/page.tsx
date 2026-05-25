import { AnimalAdminForm } from "@/components/AnimalAdminForm";
import { listCatalog } from "@/lib/store";
import { adoptionStatusLabels } from "@/lib/types";
import {
  createAnimalAction,
  deleteAnimalAction,
  updateAnimalAction,
} from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminAnimalsPage() {
  const catalog = await listCatalog();

  return (
    <>
      <div className="section-title">
        <div>
          <h1>Animais</h1>
          <p className="muted">
            Cadastre e mantenha animais disponiveis, em processo ou adotados.
          </p>
        </div>
      </div>

      <details className="panel" open>
        <summary>Cadastrar novo animal</summary>
        <div style={{ marginTop: 16 }}>
          <AnimalAdminForm
            action={createAnimalAction}
            breeds={catalog.breeds}
            sizes={catalog.sizes}
            species={catalog.species}
          />
        </div>
      </details>

      <section className="panel">
        <h2>Animais cadastrados</h2>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Animal</th>
                <th>Caracteristicas</th>
                <th>Status</th>
                <th>Local</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {catalog.animals.map((animal) => (
                <tr key={animal.id}>
                  <td>
                    <strong>{animal.name}</strong>
                    <p className="muted">{animal.description}</p>
                  </td>
                  <td>
                    {animal.speciesName}, {animal.breedName}, {animal.sizeName}
                  </td>
                  <td>
                    <span className={`pill ${animal.status}`}>
                      {adoptionStatusLabels[animal.status]}
                    </span>
                  </td>
                  <td>
                    {animal.city} - {animal.state}
                  </td>
                  <td>
                    <div className="actions">
                      <details>
                        <summary className="button secondary">Editar</summary>
                        <div className="panel" style={{ marginTop: 12 }}>
                          <AnimalAdminForm
                            action={updateAnimalAction}
                            animals={animal}
                            breeds={catalog.breeds}
                            sizes={catalog.sizes}
                            species={catalog.species}
                          />
                        </div>
                      </details>
                      <form action={deleteAnimalAction}>
                        <input name="id" type="hidden" value={animal.id} />
                        <button className="button danger" type="submit">
                          Remover
                        </button>
                      </form>
                    </div>
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
