"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateRequestStatusAction } from "../actions";

const STATUS_OPTIONS = [
  { value: "received", label: "Recebida" },
  { value: "reviewing", label: "Em analise" },
  { value: "documentation", label: "Documentacao" },
  { value: "interview", label: "Entrevista" },
  { value: "visit", label: "Visita" },
  { value: "approved", label: "Aprovada" },
  { value: "rejected", label: "Recusada" },
  { value: "completed", label: "Concluida" },
] as const;

export function RequestStatusForm({
  id,
  defaultStatus,
}: {
  id: string;
  defaultStatus: string;
}) {
  const [status, setStatus] = useState(defaultStatus);

  return (
    <form action={updateRequestStatusAction} className="actions">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="submit">Salvar</Button>
    </form>
  );
}
