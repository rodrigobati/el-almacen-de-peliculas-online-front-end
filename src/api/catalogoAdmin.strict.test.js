import { describe, it, expect } from "vitest";
import { validatePageResponse } from "./catalogoAdmin";

describe("validatePageResponse", () => {
  it("accepts valid page response in strict mode", () => {
    const payload = {
      items: [{ id: 1, titulo: "Matrix" }],
      total: 1,
      page: 0,
      size: 12,
      totalPages: 1,
    };

    const result = validatePageResponse(payload, { strict: true, status: 200, isDev: false });

    expect(result).toEqual({ ...payload, status: 200 });
  });

  it("fails in strict mode when totalPages is missing", () => {
    const payload = {
      items: [],
      total: 0,
      page: 0,
      size: 12,
    };

    expect(() => validatePageResponse(payload, { strict: true, status: 200, isDev: false })).toThrow();
  });

  it("fails in strict mode when payload is legacy array", () => {
    const payload = [{ id: 1 }];

    try {
      validatePageResponse(payload, { strict: true, status: 200, isDev: false });
      throw new Error("Expected strict mode to reject legacy array payload");
    } catch (error) {
      expect(error?.rawMessage).toBe("Legacy array response is not allowed");
      expect(error?.code).toBe("API_CONTRACT_LEGACY_ARRAY_NOT_ALLOWED");
    }
  });

  it("accepts canonical empty payload total 0 with totalPages 0", () => {
    const payload = {
      items: [],
      total: 0,
      totalPages: 0,
      page: 0,
      size: 12,
    };

    const result = validatePageResponse(payload, { strict: true, status: 200, isDev: false });

    expect(result).toEqual({ ...payload, status: 200 });
  });
});
