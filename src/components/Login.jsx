import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { login, logout } from "../services/keycloak";

export default function LoginButton() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div className="login-loading">Cargando...</div>;
  }

  if (isAuthenticated) {
    return (
      <div className="user-menu">
        <span className="welcome-text">
          Hola, {user?.preferred_username || "Usuario"}
        </span>
        <button onClick={logout} className="logout-btn">
          Cerrar Sesión
        </button>
      </div>
    );
  }

  return (
    <button onClick={login} className="login-btn">
      Iniciar Sesión
    </button>
  );
}
