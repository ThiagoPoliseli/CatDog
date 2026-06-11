import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));
vi.mock("@/lib/store", () => ({
  createAdoptionRequest: vi.fn(),
}));

import { POST } from "./route";
import { createClient } from "@/lib/supabase/server";
import { createAdoptionRequest } from "@/lib/store";

const mockGetUser = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createClient).mockResolvedValue({
    auth: { getUser: mockGetUser },
  } as never);
});

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/adoption-requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  animalId: "a1",
  adopterName: "Joao Silva",
  email: "joao@example.com",
  phone: "(11) 99999-1234",
  message: "Adoro animais e tenho espaco em casa",
};

describe("POST /api/adoption-requests", () => {
  it("returns 401 when not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const res = await POST(makeRequest(validBody));

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.message).toContain("Autenticacao");
  });

  it("returns 400 for invalid request body", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1", email: "user@example.com" } } });

    const res = await POST(makeRequest({ animalId: "" }));

    expect(res.status).toBe(400);
  });

  it("returns 200 on successful creation", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1", email: "user@example.com" } } });
    vi.mocked(createAdoptionRequest).mockResolvedValue(undefined as never);

    const res = await POST(makeRequest(validBody));

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.message).toBe("Solicitacao registrada.");
  });

  it("passes userId from auth to createAdoptionRequest", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-123", email: "user@example.com" } } });
    vi.mocked(createAdoptionRequest).mockResolvedValue(undefined as never);

    await POST(makeRequest(validBody));

    expect(createAdoptionRequest).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-123" }),
    );
  });

  it("returns 400 with error message when store throws Error", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1", email: "user@example.com" } } });
    vi.mocked(createAdoptionRequest).mockRejectedValue(new Error("Animal ja tem solicitacao"));

    const res = await POST(makeRequest(validBody));

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.message).toBe("Animal ja tem solicitacao");
  });

  it("returns generic message when store throws non-Error", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1", email: "user@example.com" } } });
    vi.mocked(createAdoptionRequest).mockRejectedValue("unexpected");

    const res = await POST(makeRequest(validBody));

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.message).toBe("Nao foi possivel registrar a solicitacao.");
  });
});
