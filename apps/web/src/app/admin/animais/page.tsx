import { AnimalAdminForm } from "@/components/AnimalAdminForm";
import { listCatalog } from "@/lib/store";
import { adoptionStatusLabels } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createAnimalAction,
  deleteAnimalAction,
  updateAnimalAction,
} from "../actions";

export const dynamic = "force-dynamic";

type AdoptionStatusVariant = "available" | "in_process" | "adopted";

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Animal</TableHead>
                <TableHead>Caracteristicas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {catalog.animals.map((animal) => (
                <TableRow key={animal.id}>
                  <TableCell>
                    <strong>{animal.name}</strong>
                    <p className="muted">{animal.description}</p>
                  </TableCell>
                  <TableCell>
                    {animal.speciesName}, {animal.breedName}, {animal.sizeName}
                  </TableCell>
                  <TableCell>
                    <Badge variant={animal.status as AdoptionStatusVariant}>
                      {adoptionStatusLabels[animal.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {animal.city} - {animal.state}
                  </TableCell>
                  <TableCell>
                    <div className="actions">
                      <details>
                        <summary className="cursor-pointer text-sm font-medium px-3 py-2 rounded-lg border border-border bg-background hover:bg-secondary">
                          Editar
                        </summary>
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
                        <Button variant="destructive" type="submit">
                          Remover
                        </Button>
                      </form>
                    </div>
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
