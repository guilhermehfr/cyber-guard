import { describe, expect, it } from "vitest";

import { PasswordService } from "./password.service.js";

describe("PasswordService", () => {
  const service = new PasswordService();

  describe("hash", () => {
    it("returns a value that differs from the plaintext password", async () => {
      const password = "correct horse battery staple";
      const result = await service.hash(password);
      expect(result).not.toBe(password);
    });

    it("produces distinct hashes for the same password", async () => {
      const [first, second] = await Promise.all([
        service.hash("same-password"),
        service.hash("same-password"),
      ]);
      expect(first).not.toBe(second);
    });
  });

  describe("verify", () => {
    it("accepts the matching password", async () => {
      const hash = await service.hash("s3cret-password");
      await expect(service.verify("s3cret-password", hash)).resolves.toBe(true);
    });

    it("rejects a wrong password", async () => {
      const hash = await service.hash("s3cret-password");
      await expect(service.verify("wrong-password", hash)).resolves.toBe(false);
    });
  });
});
