import { beforeEach, describe, expect, it } from "vitest";

import {
  signAdminToken,
  verifyAdminCredentials,
  verifyAdminToken,
} from "@/lib/auth";

beforeEach(() => {
  process.env.ADMIN_JWT_SECRET =
    "test-secret-please-make-this-at-least-32-chars-long";
  process.env.ADMIN_USERNAME = "admin";
  process.env.ADMIN_PASSWORD = "change-me-now";
});

describe("signAdminToken / verifyAdminToken", () => {
  it("round-trips a username payload", async () => {
    const token = await signAdminToken({ username: "admin" });
    const result = await verifyAdminToken(token);
    expect(result).toEqual({ username: "admin" });
  });

  it("rejects a tampered token", async () => {
    const token = await signAdminToken({ username: "admin" });
    const tampered = token.slice(0, -2) + "XX";
    const result = await verifyAdminToken(tampered);
    expect(result).toBeNull();
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await signAdminToken({ username: "admin" });
    process.env.ADMIN_JWT_SECRET =
      "different-secret-please-make-this-at-least-32-chars";
    const result = await verifyAdminToken(token);
    expect(result).toBeNull();
  });

  it("rejects garbage", async () => {
    expect(await verifyAdminToken("not-a-jwt")).toBeNull();
  });
});

describe("verifyAdminCredentials", () => {
  it("accepts the correct username/password", () => {
    expect(verifyAdminCredentials("admin", "change-me-now")).toBe(true);
  });

  it("rejects wrong password", () => {
    expect(verifyAdminCredentials("admin", "wrong-password")).toBe(false);
  });

  it("rejects wrong username", () => {
    expect(verifyAdminCredentials("not-admin", "change-me-now")).toBe(false);
  });

  it("rejects empty credentials", () => {
    expect(verifyAdminCredentials("", "")).toBe(false);
  });

  it("returns false when env vars are not set", () => {
    delete process.env.ADMIN_USERNAME;
    delete process.env.ADMIN_PASSWORD;
    expect(verifyAdminCredentials("admin", "change-me-now")).toBe(false);
  });
});
