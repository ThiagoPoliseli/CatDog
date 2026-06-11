import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockCreateUser = vi.fn();
const mockAdminClient = {
  auth: { admin: { createUser: mockCreateUser } },
};

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => mockAdminClient),
}));

vi.mock("@/lib/admin", () => ({
  getAdminEmails: vi.fn(() => ["admin@catdog.local"]),
}));

import { POST } from "./route";

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/auth/sign-up", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  name: "Joao Silva",
  email: "joao@example.com",
  password: "senha123",
};

describe("POST /api/auth/sign-up", () => {
  const savedUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const savedKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = savedUrl;
    process.env.SUPABASE_SERVICE_ROLE_KEY = savedKey;
  });

  it("returns 400 for invalid body (name too short)", async () => {
    const res = await POST(makeRequest({ name: "A", email: "a@b.com", password: "123456" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid email", async () => {
    const res = await POST(makeRequest({ ...validBody, email: "not-email" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for password shorter than 6 chars", async () => {
    const res = await POST(makeRequest({ ...validBody, password: "abc" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for malformed JSON body", async () => {
    const req = new Request("http://localhost/api/auth/sign-up", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{ invalid json }",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 500 when SUPABASE_SERVICE_ROLE_KEY is missing", async () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(500);
  });

  it("returns 403 when email is the reserved admin email", async () => {
    const res = await POST(makeRequest({ ...validBody, email: "admin@catdog.local" }));
    expect(res.status).toBe(403);
  });

  it("returns 200 on successful account creation", async () => {
    mockCreateUser.mockResolvedValue({ error: null });
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.message).toBe("Conta criada.");
  });

  it("returns 409 when email is already registered", async () => {
    mockCreateUser.mockResolvedValue({ error: { message: "User already registered" } });
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.message).toContain("ja esta cadastrado");
  });

  it("returns 409 for 'already' error variant", async () => {
    mockCreateUser.mockResolvedValue({ error: { message: "already exists" } });
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(409);
  });

  it("returns 400 for other creation errors", async () => {
    mockCreateUser.mockResolvedValue({ error: { message: "Database connection failed" } });
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.message).toBe("Database connection failed");
  });
});
