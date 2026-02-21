import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import AdminCatalogo from "./AdminCatalogo";

const listMoviesMock = vi.fn();

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    keycloak: {
      token: "test-token",
    },
  }),
}));

vi.mock("../api/movies", () => ({
  searchMovies: vi.fn(),
}));

vi.mock("../utils/devDiagnostics", () => ({
  emitDevEvent: vi.fn(),
}));

vi.mock("../api/catalogoAdmin", () => ({
  listMovies: (...args) => listMoviesMock(...args),
  getMovieDetail: vi.fn(),
  createMovie: vi.fn(),
  updateMovie: vi.fn(),
  retireMovie: vi.fn(),
}));

describe("AdminCatalogo pagination contract", () => {
  beforeEach(() => {
    listMoviesMock.mockReset();
  });

  it("renders empty-state and does not render page 1 of 0", async () => {
    listMoviesMock.mockResolvedValue({
      items: [],
      total: 0,
      totalPages: 0,
      page: 0,
      size: 12,
      status: 200,
    });

    render(<AdminCatalogo />);

    await waitFor(() => {
      expect(screen.getByText("No hay películas para mostrar.")).toBeInTheDocument();
    });

    expect(screen.queryByText("Página 1 de 0")).not.toBeInTheDocument();
  });

  it("enables next and disables prev on first page when totalPages is greater than 0", async () => {
    listMoviesMock.mockResolvedValue({
      items: [{ id: 1, titulo: "Matrix", precio: 10 }],
      total: 3,
      totalPages: 3,
      page: 0,
      size: 12,
      status: 200,
    });

    render(<AdminCatalogo />);

    await waitFor(() => {
      expect(screen.getByText("Página 1 de 3")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Siguiente" })).toBeEnabled();
  });
});
