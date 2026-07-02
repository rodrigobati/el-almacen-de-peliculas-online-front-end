import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import CompraDetalle from "./CompraDetalle";
import useCompraStatus from "../hooks/useCompraStatus";

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({ token: "token" })
}));

vi.mock("../hooks/useCompraStatus", () => ({
  default: vi.fn()
}));

function renderCompraDetalle() {
  return render(
    <MemoryRouter initialEntries={["/compras/7"]}>
      <Routes>
        <Route path="/compras/:id" element={<CompraDetalle />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("CompraDetalle", () => {
  it("muestra un rechazo amigable sin detalles tecnicos", () => {
    useCompraStatus.mockReturnValue({
      compra: {
        id: 7,
        estado: "RECHAZADA",
        motivoRechazo: "STOCK_INSUFICIENTE",
        detallesRechazo: "peliculaId=4, solicitado=1, disponible=0",
        fecha: "2026-06-16T23:22:17",
        subtotal: 11999,
        descuentoAplicado: 0,
        total: 11999,
        items: []
      },
      loading: false,
      error: null,
      isPolling: false
    });

    renderCompraDetalle();

    expect(screen.getByText("No pudimos confirmar la compra")).toBeInTheDocument();
    expect(
      screen.getByText("No queda stock disponible para completar esta compra. El importe fue reintegrado a tu billetera.")
    ).toBeInTheDocument();
    expect(screen.queryByText("Detalles técnicos")).not.toBeInTheDocument();
    expect(screen.queryByText(/peliculaId=4/)).not.toBeInTheDocument();
  });
});
