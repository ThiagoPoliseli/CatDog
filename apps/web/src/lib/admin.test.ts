import { describe, it, expect, afterEach } from "vitest";
import { getAdminEmails, isAdminUser } from "./admin";
import type { User } from "@supabase/supabase-js";

describe("getAdminEmails", () => {
  const originalEnv = process.env.ADMIN_EMAIL;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.ADMIN_EMAIL;
    } else {
      process.env.ADMIN_EMAIL = originalEnv;
    }
  });

  it("returns default email when ADMIN_EMAIL is not set", () => {
    delete process.env.ADMIN_EMAIL;
    expect(getAdminEmails()).toEqual(["admin@catdog.local"]);
  });

  it("returns single email from env", () => {
    process.env.ADMIN_EMAIL = "boss@example.com";
    expect(getAdminEmails()).toEqual(["boss@example.com"]);
  });

  it("returns multiple emails split by comma", () => {
    process.env.ADMIN_EMAIL = "a@example.com, B@EXAMPLE.COM";
    expect(getAdminEmails()).toEqual(["a@example.com", "b@example.com"]);
  });

  it("filters empty entries from multiple commas", () => {
    process.env.ADMIN_EMAIL = "a@example.com,,b@example.com";
    expect(getAdminEmails()).toEqual(["a@example.com", "b@example.com"]);
  });

  it("lowercases all emails", () => {
    process.env.ADMIN_EMAIL = "ADMIN@CATDOG.LOCAL";
    expect(getAdminEmails()).toEqual(["admin@catdog.local"]);
  });
});

describe("isAdminUser", () => {
  afterEach(() => {
    process.env.ADMIN_EMAIL = "admin@catdog.local";
  });

  it("returns false for null user", () => {
    process.env.ADMIN_EMAIL = "admin@catdog.local";
    expect(isAdminUser(null)).toBe(false);
  });

  it("returns false for user with no email", () => {
    process.env.ADMIN_EMAIL = "admin@catdog.local";
    expect(isAdminUser({ email: undefined } as unknown as User)).toBe(false);
  });

  it("returns true for matching admin email", () => {
    process.env.ADMIN_EMAIL = "admin@catdog.local";
    expect(isAdminUser({ email: "admin@catdog.local" } as User)).toBe(true);
  });

  it("matches admin email case-insensitively", () => {
    process.env.ADMIN_EMAIL = "admin@catdog.local";
    expect(isAdminUser({ email: "ADMIN@CATDOG.LOCAL" } as User)).toBe(true);
  });

  it("returns false for non-admin email", () => {
    process.env.ADMIN_EMAIL = "admin@catdog.local";
    expect(isAdminUser({ email: "user@example.com" } as User)).toBe(false);
  });

  it("matches one of multiple admin emails", () => {
    process.env.ADMIN_EMAIL = "a@example.com,b@example.com";
    expect(isAdminUser({ email: "b@example.com" } as User)).toBe(true);
  });
});
