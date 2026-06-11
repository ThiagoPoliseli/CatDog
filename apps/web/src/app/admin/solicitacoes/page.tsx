import { listCatalog } from "@/lib/store";
import { requestStatusLabels } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RequestStatusForm } from "./request-status-form";

export const dynamic = "force-dynamic";

const statusVariant: Record<string, "available" | "in_process" | "adopted" | "species" | "cancelled" | "default"> = {
  received: "default",
  reviewing: "in_process",
  documentation: "in_process",
  interview: "in_process",
  visit: "in_process",
  approved: "available",
  completed: "available",
  rejected: "cancelled",
  cancelled: "cancelled",
};

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
                <TableHead>Perfil</TableHead>
                <TableHead>Animal</TableHead>
                <TableHead>Mensagem</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {catalog.adoptionRequests.map((request) => {
                const animal = catalog.animals.find((a) => a.id === request.animalId);
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
                    <TableCell>
                      <div className="grid gap-0.5 text-xs text-muted-foreground">
                        {request.housingType && (
                          <span>🏠 {request.housingType}</span>
                        )}
                        {request.hasOtherPets !== undefined && (
                          <span>{request.hasOtherPets ? "🐾 Tem outros animais" : "🐾 Sem outros animais"}</span>
                        )}
                        {request.adultsCount !== undefined && (
                          <span>👥 {request.adultsCount} adulto{request.adultsCount !== 1 ? "s" : ""}{request.childrenCount ? `, ${request.childrenCount} crianca${request.childrenCount !== 1 ? "s" : ""}` : ""}</span>
                        )}
                        {request.hoursAlonePerDay !== undefined && (
                          <span>⏱ {request.hoursAlonePerDay}h sozinho/dia</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{animal?.name ?? "Animal removido"}</TableCell>
                    <TableCell className="max-w-48">
                      <p className="line-clamp-3 text-sm">{request.message}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[request.status] ?? "default"}>
                        {requestStatusLabels[request.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <RequestStatusForm id={request.id} defaultStatus={request.status} />
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
