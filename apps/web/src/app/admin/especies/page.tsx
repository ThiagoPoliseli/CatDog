import { listCatalog } from "@/lib/store";
import { createSpeciesAction, deleteSpeciesAction } from "../actions";
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
          <div className="grid gap-1.5">
            <Label htmlFor="species-name">Nome da especie</Label>
            <Input id="species-name" name="name" required />
          </div>
          <div className="flex items-end">
            <Button type="submit">Adicionar</Button>
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="table-wrap">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {catalog.species.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.slug}</TableCell>
                  <TableCell>
                    <form action={deleteSpeciesAction}>
                      <input name="id" type="hidden" value={item.id} />
                      <Button variant="destructive" type="submit">
                        Remover
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </>
  );
}
