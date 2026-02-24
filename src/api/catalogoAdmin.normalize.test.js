import { describe, it, expect } from "vitest";
import { normalizeListPayload } from "./catalogoAdmin";

describe("normalizeListPayload", () => {
  it("converts array payload into items/total", () => {
    const payload = [{ id: 1 }, { id: 2 }];
    const result = normalizeListPayload(payload, 200);
    expect(result).toEqual({
      items: payload,
      total: 2,
      page: 0,
      size: 2,
      totalPages: 1,
      status: 200,
    });
  });

  it("preserves paginated object payload and attaches status", () => {
    const payload = {
      items: [{ id: 1 }],
      total: 1,
      page: 0,
      size: 12,
      totalPages: 1,
    };
    const result = normalizeListPayload(payload, 200);
    expect(result).toEqual({
      items: [{ id: 1 }],
      total: 1,
      page: 0,
      size: 12,
      totalPages: 1,
      status: 200,
    });
  });
});
