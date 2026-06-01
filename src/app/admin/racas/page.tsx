import { listCatalog } from "@/lib/store";
import { createBreedAction, deleteBreedAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
          <div className="grid gap-1.5">
            <Label htmlFor="breed-name">Nome da raca</Label>
            <Input id="breed-name" name="name" required />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="breed-species">Especie</Label>
            <select
              id="breed-species"
              className="flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              name="speciesId"
              required
            >
              <option value="">Selecione</option>
              {catalog.species.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div className="full flex items-end">
            <Button type="submit" className="w-full">
              Adicionar
            </Button>
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="table-wrap">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Especie</TableHead>
                <TableHead>Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {catalog.breeds.map((item) => {
                const speciesItem = catalog.species.find(
                  (s) => s.id === item.speciesId,
                );
                return (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{speciesItem?.name ?? "Nao identificada"}</TableCell>
                    <TableCell>
                      <form action={deleteBreedAction}>
                        <input name="id" type="hidden" value={item.id} />
                        <Button variant="destructive" type="submit">
                          Remover
                        </Button>
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
