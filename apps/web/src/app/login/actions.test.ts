import { describe, it, expect, vi } from "vitest";

vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

import { loginAction } from "./actions";
import { redirect } from "next/navigation";

describe("loginAction", () => {
  it("redirects to /entrar", async () => {
    await loginAction();
    expect(redirect).toHaveBeenCalledWith("/entrar");
  });
});
