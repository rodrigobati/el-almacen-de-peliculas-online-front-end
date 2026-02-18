import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import CatalogPage from "./pages/Catalogo";
import Carrito from "./pages/Carrito";
import Compras from "./pages/Compras";
import CompraDetalle from "./pages/CompraDetalle";
import AdminCatalogo from "./pages/AdminCatalogo";
import LoginButton from "./components/LoginButton";
import ProtectedRoute from "./components/ProtectedRoute";

function AppLayout() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <div className="app">
      <header className="app-header">
        <h1>El Almacén de Películas</h1>
        <div className="app-actions">
          {!loading && isAuthenticated && (
            <Link to="/admin/catalogo" className="nav-admin-btn">
              🛠 Admin
            </Link>
          )}
          <Link to="/carrito" className="nav-cart-btn">
            🛒 Carrito
          </Link>
          <Link to="/compras" className="nav-cart-btn">
            📦 Compras
          </Link>
          <LoginButton />
        </div>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route
            path="/admin/catalogo"
            element={
              <ProtectedRoute>
                <AdminCatalogo />
              </ProtectedRoute>
            }
          />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/compras" element={<Compras />} />
          <Route path="/compras/:id" element={<CompraDetalle />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}
