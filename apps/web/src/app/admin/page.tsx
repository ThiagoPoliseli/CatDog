import { ClipboardList, PawPrint, Ruler, Tags } from "lucide-react";
import { listCatalog } from "@/lib/store";
import { adoptionStatusLabels, requestStatusLabels } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const catalog = await listCatalog();
  const available = catalog.animals.filter(
    (animal) => animal.status === "available",
  ).length;
  const inProcess = catalog.animals.filter(
    (animal) => animal.status === "in_process",
  ).length;
  const adopted = catalog.animals.filter(
    (animal) => animal.status === "adopted",
  ).length;

  return (
    <>
      <div className="section-title">
        <div>
          <h1>Visao geral</h1>
          <p className="muted">
            Acompanhe cadastros, status e solicitacoes de adocao.
          </p>
        </div>
      </div>

      <section className="stats">
        <div className="stat">
          <PawPrint size={22} aria-hidden />
          <span className="muted">Animais</span>
          <strong>{catalog.animals.length}</strong>
        </div>
        <div className="stat">
          <ClipboardList size={22} aria-hidden />
          <span className="muted">Solicitacoes</span>
          <strong>{catalog.adoptionRequests.length}</strong>
        </div>
        <div className="stat">
          <Tags size={22} aria-hidden />
          <span className="muted">Especies e racas</span>
          <strong>{catalog.species.length + catalog.breeds.length}</strong>
        </div>
        <div className="stat">
          <Ruler size={22} aria-hidden />
          <span className="muted">Portes</span>
          <strong>{catalog.sizes.length}</strong>
        </div>
      </section>

      <section className="panel">
        <h2>Status dos animais</h2>
        <div className="actions">
          <Badge variant="available">
            {adoptionStatusLabels.available}: {available}
          </Badge>
          <Badge variant="in_process">
            {adoptionStatusLabels.in_process}: {inProcess}
          </Badge>
          <Badge variant="adopted">
            {adoptionStatusLabels.adopted}: {adopted}
          </Badge>
        </div>
      </section>

      <section className="panel">
        <h2>Ultimas solicitacoes</h2>
        <div className="table-wrap">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Interessado</TableHead>
                <TableHead>Animal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Contato</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {catalog.adoptionRequests.slice(0, 5).map((request) => {
                const animal = catalog.animals.find(
                  (item) => item.id === request.animalId,
                );
                return (
                  <TableRow key={request.id}>
                    <TableCell>{request.adopterName}</TableCell>
                    <TableCell>{animal?.name ?? "Animal removido"}</TableCell>
                    <TableCell>{requestStatusLabels[request.status]}</TableCell>
                    <TableCell>{request.email}</TableCell>
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
