import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import CatalogPage from "./pages/Catalogo";
import LoginButton from "./components/LoginButton";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app">
          <header className="app-header">
            <h1>El Almacén de Películas</h1>
            <LoginButton />
          </header>

          <main className="app-main">
            <Routes>
              <Route path="/" element={<CatalogPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
