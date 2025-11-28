import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { login } from "../services/keycloak";
import UserMenu from "./UserMenu";

export default function LoginButton() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="user-menu">
        <div className="login-loading">Cargando...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <UserMenu />;
  }

  return (
    <div className="user-menu">
      <button onClick={login} className="login-btn">
        Iniciar Sesión
      </button>
    </div>
  );
}
