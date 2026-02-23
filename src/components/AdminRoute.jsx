import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AccessDenied from "./AccessDenied";

export default function AdminRoute({ children }) {
  const { isAuthenticated, loading, isAdmin, authInitialized, roles } = useAuth();
  const location = useLocation();
  const isDev = import.meta.env?.DEV;

  // Always declare hooks/effects before early returns to satisfy React rules.
  useEffect(() => {
    if (!isDev) return;
    // Log when authInitialized becomes true or when path changes
    console.debug("[AdminRoute] auth check:", {
      path: location.pathname,
      isAuthenticated,
      authInitialized,
      isAdmin,
      roles,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authInitialized, location.pathname]);

  // While Keycloak init hasn't completed, render a neutral placeholder (don't block).
  if (!authInitialized) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p className="muted">Cargando sesión...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  if (!isAdmin) {
    return <AccessDenied />;
  }

  return children;
}
