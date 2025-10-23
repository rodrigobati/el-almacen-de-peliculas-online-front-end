// src/components/UserMenu.jsx
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  logout,
  openAccountManagement,
  deleteAccount,
} from "../services/keycloak";

export default function UserMenu() {
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      // El logout se hace automáticamente en deleteAccount
    } catch (error) {
      alert(`Error al eliminar la cuenta: ${error.message}`);
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
    }
  };

  const handleManageAccount = () => {
    try {
      openAccountManagement();
    } catch (error) {
      console.error("Error abriendo gestión de cuenta:", error);
      // Fallback: mostrar información del usuario en un alert
      alert(
        `Información de la cuenta:\n\nUsuario: ${
          user?.preferred_username
        }\nEmail: ${user?.email || "No disponible"}\nNombre: ${
          user?.name || "No disponible"
        }`
      );
    }
    setShowMenu(false);
  };

  return (
    <div className="user-menu-container">
      <div className="user-menu">
        <span className="welcome-text">
          Hola, {user?.preferred_username || "Usuario"}
        </span>

        <div className="user-dropdown">
          <button
            className="user-menu-btn"
            onClick={() => setShowMenu(!showMenu)}
          >
            ⚙️
          </button>

          {showMenu && (
            <div className="user-dropdown-menu">
              <button onClick={handleManageAccount} className="dropdown-item">
                👤 Gestionar Cuenta
              </button>

              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="dropdown-item delete-item"
              >
                {isDeleting ? "⏳ Eliminando..." : "🗑️ Eliminar Cuenta"}
              </button>

              <hr className="dropdown-separator" />

              <button
                onClick={() => {
                  logout();
                  setShowMenu(false);
                }}
                className="dropdown-item"
              >
                🚪 Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>

      {showMenu && (
        <div className="dropdown-backdrop" onClick={() => setShowMenu(false)} />
      )}
    </div>
  );
}
