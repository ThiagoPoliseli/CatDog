import { listCatalog } from "@/lib/store";
import { requestStatusLabels } from "@/lib/types";
import { updateRequestStatusAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminRequestsPage() {
  const catalog = await listCatalog();

  return (
    <>
      <div className="section-title">
        <div>
          <h1>Solicitacoes</h1>
          <p className="muted">
            Acompanhe interessados e atualize etapas do processo de adocao.
          </p>
        </div>
      </div>

      <section className="panel">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Interessado</th>
                <th>Animal</th>
                <th>Mensagem</th>
                <th>Status</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {catalog.adoptionRequests.map((request) => {
                const animal = catalog.animals.find(
                  (item) => item.id === request.animalId,
                );
                return (
                  <tr key={request.id}>
                    <td>
                      <strong>{request.adopterName}</strong>
                      <p className="muted">
                        {request.email}
                        <br />
                        {request.phone}
                      </p>
                    </td>
                    <td>{animal?.name ?? "Animal removido"}</td>
                    <td>{request.message}</td>
                    <td>{requestStatusLabels[request.status]}</td>
                    <td>
                      <form action={updateRequestStatusAction} className="actions">
                        <input name="id" type="hidden" value={request.id} />
                        <select
                          className="select"
                          defaultValue={request.status}
                          name="status"
                        >
                          <option value="received">Recebida</option>
                          <option value="reviewing">Em analise</option>
                          <option value="approved">Aprovada</option>
                          <option value="rejected">Recusada</option>
                          <option value="completed">Concluida</option>
                        </select>
                        <button className="button" type="submit">
                          Salvar
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
