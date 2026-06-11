import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("returns a single class unchanged", () => {
    expect(cn("foo")).toBe("foo");
  });
  it("merges multiple classes", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });
  it("resolves tailwind conflicts (last wins)", () => {
    expect(cn("px-4", "px-8")).toBe("px-8");
  });
  it("ignores falsy values", () => {
    expect(cn("foo", false, undefined, "bar")).toBe("foo bar");
  });
  it("handles conditional classes", () => {
    expect(cn("base", true && "active", false && "disabled")).toBe("base active");
  });
});
