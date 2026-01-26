// src/components/UserMenu.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { logout, openAccountManagement } from "../services/keycloak";

export default function UserMenu() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  const handleManageAccount = () => {
    setIsOpen(false);
    openAccountManagement();
  };

  const handleGoToCart = () => {
    setIsOpen(false);
    navigate("/carrito");
  };

  return (
    <div className="user-menu">
      <div className="user-info">
        <span className="welcome-text">
          Hola, {user?.preferred_username || "Usuario"}
        </span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="settings-btn"
          title="Configuración de cuenta"
        >
          ⚙️
        </button>
      </div>

      {isOpen && (
        <div className="dropdown-menu">
          <button onClick={handleGoToCart} className="dropdown-item">
            🛒 Mi Carrito
          </button>
          <button onClick={handleManageAccount} className="dropdown-item">
            👤 Gestionar Cuenta
          </button>
          <button onClick={handleLogout} className="dropdown-item logout-btn">
            🚪 Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );
}
