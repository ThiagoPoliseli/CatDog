import { describe, it, expect } from "vitest";
import { adoptionStatusLabels, requestStatusLabels } from "./types";

describe("adoptionStatusLabels", () => {
  it("has label for available", () => {
    expect(adoptionStatusLabels.available).toBe("Disponivel");
  });
  it("has label for in_process", () => {
    expect(adoptionStatusLabels.in_process).toBe("Em processo");
  });
  it("has label for adopted", () => {
    expect(adoptionStatusLabels.adopted).toBe("Adotado");
  });
});

describe("requestStatusLabels", () => {
  it("has label for all statuses", () => {
    expect(requestStatusLabels.received).toBe("Recebida");
    expect(requestStatusLabels.reviewing).toBe("Em analise");
    expect(requestStatusLabels.approved).toBe("Aprovada");
    expect(requestStatusLabels.rejected).toBe("Recusada");
    expect(requestStatusLabels.completed).toBe("Concluida");
    expect(requestStatusLabels.cancelled).toBe("Cancelada");
  });
});
