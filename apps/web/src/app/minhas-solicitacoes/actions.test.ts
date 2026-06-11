import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: vi.fn().mockImplementation((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/store", () => ({ updateAdoptionRequestStatus: vi.fn() }));

import { cancelAdoptionRequestAction } from "./actions";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { updateAdoptionRequestStatus } from "@/lib/store";

const mockGetUser = vi.fn();
const mockSingle = vi.fn();
const mockEq2 = vi.fn().mockReturnValue({ single: mockSingle });
const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createClient).mockResolvedValue({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  } as never);
  mockFrom.mockReturnValue({ select: mockSelect });
  mockSelect.mockReturnValue({ eq: mockEq1 });
  mockEq1.mockReturnValue({ eq: mockEq2 });
  mockEq2.mockReturnValue({ single: mockSingle });
});

describe("cancelAdoptionRequestAction", () => {
  it("redirects to /entrar when not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const fd = new FormData();
    fd.set("id", "req1");

    await expect(cancelAdoptionRequestAction(fd)).rejects.toThrow("NEXT_REDIRECT:/entrar");
    expect(updateAdoptionRequestStatus).not.toHaveBeenCalled();
  });

  it("returns early when request not found", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    mockSingle.mockResolvedValue({ data: null });

    const fd = new FormData();
    fd.set("id", "req1");

    await cancelAdoptionRequestAction(fd);

    expect(updateAdoptionRequestStatus).not.toHaveBeenCalled();
  });

  it("returns early for non-cancellable status (approved)", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    mockSingle.mockResolvedValue({ data: { status: "approved", user_id: "u1" } });

    const fd = new FormData();
    fd.set("id", "req1");

    await cancelAdoptionRequestAction(fd);

    expect(updateAdoptionRequestStatus).not.toHaveBeenCalled();
  });

  it("cancels request with status received", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    mockSingle.mockResolvedValue({ data: { status: "received", user_id: "u1" } });
    vi.mocked(updateAdoptionRequestStatus).mockResolvedValue(undefined);

    const fd = new FormData();
    fd.set("id", "req1");

    await cancelAdoptionRequestAction(fd);

    expect(updateAdoptionRequestStatus).toHaveBeenCalledWith("req1", "cancelled");
    expect(revalidatePath).toHaveBeenCalledWith("/minhas-solicitacoes");
  });

  it("cancels request with status reviewing", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    mockSingle.mockResolvedValue({ data: { status: "reviewing", user_id: "u1" } });
    vi.mocked(updateAdoptionRequestStatus).mockResolvedValue(undefined);

    const fd = new FormData();
    fd.set("id", "req1");

    await cancelAdoptionRequestAction(fd);

    expect(updateAdoptionRequestStatus).toHaveBeenCalledWith("req1", "cancelled");
  });
});
