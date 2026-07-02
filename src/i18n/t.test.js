import { describe, expect, it } from "vitest";
import { purchaseStatusClass, purchaseStatusLabel } from "./t";

describe("purchase status presentation", () => {
  it("renders rejected status in red for both RECHAZADA and RECHAZADO", () => {
    expect(purchaseStatusLabel("RECHAZADA")).toBe("RECHAZADA");
    expect(purchaseStatusLabel("RECHAZADO")).toBe("RECHAZADA");
    expect(purchaseStatusClass("RECHAZADA")).toContain("purchase-status-rejected");
    expect(purchaseStatusClass("RECHAZADO")).toContain("purchase-status-rejected");
  });

  it("normalizes status casing before translating", () => {
    expect(purchaseStatusLabel("pending")).toBe("PENDIENTE");
    expect(purchaseStatusClass("confirmada")).toContain("purchase-status-confirmed");
  });
});
