import type { AnimalView, Breed, Size, Species } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  animals?: AnimalView;
  breeds: Breed[];
  sizes: Size[];
  species: Species[];
};

const selectClass =
  "flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

type SelectFieldProps = {
  id: string;
  label: string;
  name: string;
  defaultValue?: string;
  children: React.ReactNode;
};

function SelectField({ id, label, name, defaultValue, children }: SelectFieldProps) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <select id={id} className={selectClass} defaultValue={defaultValue} name={name} required>
        {children}
      </select>
    </div>
  );
}

type AnimalDefaults = {
  id: string;
  name: string;
  imageUrl: string;
  speciesId: string;
  breedId: string;
  sizeId: string;
  ageMonths: number;
  sex: string;
  status: string;
  city: string;
  state: string;
  description: string;
};

function resolveDefaults(animals?: AnimalView): AnimalDefaults | null {
  if (!animals) {
    return null;
  }
  return {
    id: animals.id,
    name: animals.name,
    imageUrl: animals.imageUrl,
    speciesId: animals.speciesId,
    breedId: animals.breedId,
    sizeId: animals.sizeId,
    ageMonths: animals.ageMonths,
    sex: animals.sex,
    status: animals.status,
    city: animals.city,
    state: animals.state,
    description: animals.description,
  };
}

export function AnimalAdminForm({ action, animals, breeds, sizes, species }: Props) {
  const defaults = resolveDefaults(animals);

  return (
    <form action={action} className="form-grid">
      {defaults ? <input name="id" type="hidden" value={defaults.id} /> : null}

      <div className="grid gap-1.5">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" defaultValue={defaults?.name} name="name" required />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="imageUrl">Imagem</Label>
        <Input id="imageUrl" defaultValue={defaults?.imageUrl} name="imageUrl" required type="url" />
      </div>

      <SelectField id="speciesId" label="Especie" name="speciesId" defaultValue={defaults?.speciesId}>
        <option value="">Selecione</option>
        {species.map((item) => (
          <option key={item.id} value={item.id}>{item.name}</option>
        ))}
      </SelectField>

      <SelectField id="breedId" label="Raca" name="breedId" defaultValue={defaults?.breedId}>
        <option value="">Selecione</option>
        {breeds.map((item) => (
          <option key={item.id} value={item.id}>{item.name}</option>
        ))}
      </SelectField>

      <SelectField id="sizeId" label="Porte" name="sizeId" defaultValue={defaults?.sizeId}>
        <option value="">Selecione</option>
        {sizes.map((item) => (
          <option key={item.id} value={item.id}>{item.name}</option>
        ))}
      </SelectField>

      <div className="grid gap-1.5">
        <Label htmlFor="ageMonths">Idade em meses</Label>
        <Input id="ageMonths" defaultValue={defaults?.ageMonths ?? 0} min={0} name="ageMonths" required type="number" />
      </div>

      <SelectField id="sex" label="Sexo" name="sex" defaultValue={defaults?.sex ?? "Macho"}>
        <option value="Macho">Macho</option>
        <option value="Femea">Femea</option>
      </SelectField>

      <SelectField id="status" label="Status" name="status" defaultValue={defaults?.status ?? "available"}>
        <option value="available">Disponivel</option>
        <option value="in_process">Em processo</option>
        <option value="adopted">Adotado</option>
      </SelectField>

      <div className="grid gap-1.5">
        <Label htmlFor="city">Cidade</Label>
        <Input id="city" defaultValue={defaults?.city} name="city" required />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="state">Estado</Label>
        <Input id="state" defaultValue={defaults?.state} maxLength={2} name="state" required />
      </div>

      <div className="grid gap-1.5 full">
        <Label htmlFor="description">Descricao</Label>
        <Textarea id="description" defaultValue={defaults?.description} name="description" required />
      </div>

      <Button className="full w-full" type="submit">
        {defaults ? "Salvar alteracoes" : "Cadastrar animal"}
      </Button>
    </form>
  );
}
