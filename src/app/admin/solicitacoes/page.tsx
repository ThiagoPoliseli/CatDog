import { listCatalog } from "@/lib/store";
import { requestStatusLabels } from "@/lib/types";
import { updateRequestStatusAction } from "../actions";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Interessado</TableHead>
                <TableHead>Animal</TableHead>
                <TableHead>Mensagem</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {catalog.adoptionRequests.map((request) => {
                const animal = catalog.animals.find(
                  (item) => item.id === request.animalId,
                );
                return (
                  <TableRow key={request.id}>
                    <TableCell>
                      <strong>{request.adopterName}</strong>
                      <p className="muted">
                        {request.email}
                        <br />
                        {request.phone}
                      </p>
                    </TableCell>
                    <TableCell>{animal?.name ?? "Animal removido"}</TableCell>
                    <TableCell>{request.message}</TableCell>
                    <TableCell>{requestStatusLabels[request.status]}</TableCell>
                    <TableCell>
                      <form action={updateRequestStatusAction} className="actions">
                        <input name="id" type="hidden" value={request.id} />
                        <select
                          className="flex h-11 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          defaultValue={request.status}
                          name="status"
                        >
                          <option value="received">Recebida</option>
                          <option value="reviewing">Em analise</option>
                          <option value="approved">Aprovada</option>
                          <option value="rejected">Recusada</option>
                          <option value="completed">Concluida</option>
                        </select>
                        <Button type="submit">Salvar</Button>
                      </form>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </section>
    </>
  );
}
