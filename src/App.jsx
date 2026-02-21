import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import CatalogPage from "./pages/Catalogo";
import Carrito from "./pages/Carrito";
import Compras from "./pages/Compras";
import CompraDetalle from "./pages/CompraDetalle";
import AdminCatalogo from "./pages/AdminCatalogo";
import LoginButton from "./components/LoginButton";
import { Descuentos } from "./pages/Descuento";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import { t } from "./i18n/t";

function AppLayout() {
  const { isAuthenticated, loading, isAdmin } = useAuth();

  return (
    <div className="app">
      <header className="app-header">
        <h1>El Almacén de Películas</h1>
        <div className="app-actions">
          {!loading && isAuthenticated && isAdmin && (
            <Link to="/admin/catalogo" className="nav-admin-btn">
              🛠 {t("navigation.admin")}
            </Link>
          )}
          <Link to="/carrito" className="nav-cart-btn">
            🛒 {t("navigation.cart")}
          </Link>
          <Link to="/compras" className="nav-cart-btn">
            📦 {t("navigation.purchases")}
          </Link>
          <Link to="/descuentos" className="nav-cart-btn">
            🎟 {t("navigation.discounts")}
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
              <AdminRoute>
                <AdminCatalogo />
              </AdminRoute>
            }
          />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/compras" element={<Compras />} />
          <Route path="/compras/:id" element={<CompraDetalle />} />
          <Route path="/descuentos" element={<Descuentos />} />
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
