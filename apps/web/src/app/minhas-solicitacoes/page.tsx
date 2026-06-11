import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listUserAdoptionRequests, readDb } from "@/lib/store";
import { requestStatusLabels } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cancelAdoptionRequestAction } from "./actions";

export const dynamic = "force-dynamic";

type RequestStatusVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "available"
  | "in_process"
  | "adopted"
  | "species"
  | "cancelled";

function requestStatusBadgeVariant(status: string): RequestStatusVariant {
  switch (status) {
    case "approved":
    case "completed":
      return "available";
    case "rejected":
      return "destructive";
    case "cancelled":
      return "cancelled";
    case "reviewing":
      return "in_process";
    default:
      return "secondary";
  }
}

export default async function MinhasSolicitacoesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar");
  }

  const [requests, db] = await Promise.all([
    listUserAdoptionRequests(user.id),
    readDb(),
  ]);

  return (
    <main className="page">
      <div className="section-title" style={{ marginBottom: 24 }}>
        <div>
          <h1>Minhas Solicitacoes</h1>
          <p className="muted">Acompanhe o status dos seus pedidos de adocao.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <p className="text-sm text-muted-foreground">
            {requests.length} solicitacao{requests.length !== 1 ? "es" : ""}{" "}
            encontrada{requests.length !== 1 ? "s" : ""}
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          {requests.length === 0 ? (
            <div className="empty">Nenhuma solicitacao enviada ainda.</div>
          ) : (
            <div className="table-wrap">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Animal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Mensagem</TableHead>
                    <TableHead>Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => {
                    const animal = db.animals.find(
                      (item) => item.id === request.animalId,
                    );
                    const date = new Date(request.createdAt).toLocaleDateString(
                      "pt-BR",
                    );
                    const canCancel =
                      request.status === "received" ||
                      request.status === "reviewing";
                    return (
                      <TableRow key={request.id}>
                        <TableCell>
                          <strong>{animal?.name ?? "Animal removido"}</strong>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={requestStatusBadgeVariant(request.status)}
                          >
                            {requestStatusLabels[request.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>{date}</TableCell>
                        <TableCell>{request.message}</TableCell>
                        <TableCell>
                          {canCancel && (
                            <form action={cancelAdoptionRequestAction} style={{ display: "inline" }}>
                              <input
                                type="hidden"
                                name="id"
                                value={request.id}
                              />
                              <Button
                                type="submit"
                                variant="destructive"
                                size="sm"
                              >
                                Cancelar
                              </Button>
                            </form>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
