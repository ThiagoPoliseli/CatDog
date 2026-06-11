import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));

import { userSignOutAction } from "./actions";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const mockSignOut = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createClient).mockResolvedValue({
    auth: { signOut: mockSignOut },
  } as never);
  mockSignOut.mockResolvedValue({});
});

describe("userSignOutAction", () => {
  it("signs out and redirects to /entrar", async () => {
    await userSignOutAction();
    expect(mockSignOut).toHaveBeenCalled();
    expect(redirect).toHaveBeenCalledWith("/entrar");
  });
});
