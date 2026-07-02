import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import useCompraStatus from "./useCompraStatus";
import { getCompraDetalle } from "../api/ventas";

vi.mock("../api/ventas", () => ({
  getCompraDetalle: vi.fn(),
}));

async function flushEffects() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe("useCompraStatus", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    getCompraDetalle.mockReset();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("polls mientras la compra esta PENDING y corta cuando queda CONFIRMADA", async () => {
    getCompraDetalle
      .mockResolvedValueOnce({ id: 5, estado: "PENDING" })
      .mockResolvedValueOnce({ id: 5, estado: "CONFIRMADA" });

    const { result } = renderHook(() => useCompraStatus(5, "token"));

    await flushEffects();

    expect(result.current.compra?.estado).toBe("PENDING");
    expect(result.current.isPolling).toBe(true);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(result.current.compra?.estado).toBe("CONFIRMADA");
    expect(result.current.isPolling).toBe(false);

    expect(getCompraDetalle).toHaveBeenCalledTimes(2);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    expect(getCompraDetalle).toHaveBeenCalledTimes(2);
  });

  it("no inicia polling si la compra ya viene CONFIRMADA", async () => {
    getCompraDetalle.mockResolvedValueOnce({ id: 5, estado: "CONFIRMADA" });

    const { result } = renderHook(() => useCompraStatus(5, "token"));

    await flushEffects();

    expect(result.current.compra?.estado).toBe("CONFIRMADA");
    expect(result.current.isPolling).toBe(false);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });

    expect(getCompraDetalle).toHaveBeenCalledTimes(1);
  });
});
