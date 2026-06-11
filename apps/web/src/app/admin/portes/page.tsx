import { listCatalog } from "@/lib/store";
import { createSizeAction, deleteSizeAction } from "../actions";
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
          <div className="grid gap-1.5">
            <Label htmlFor="size-name">Nome do porte</Label>
            <Input id="size-name" name="name" required />
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
              {catalog.sizes.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.slug}</TableCell>
                  <TableCell>
                    <form action={deleteSizeAction}>
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
