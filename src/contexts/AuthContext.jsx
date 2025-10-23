import React, { createContext, useContext, useState, useEffect } from "react";
import {
  initKeycloak,
  keycloak,
  isLoggedIn,
  getUserInfo,
} from "../services/keycloak";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initKeycloak()
      .then((authenticated) => {
        setIsAuthenticated(authenticated);
        if (authenticated) {
          setUser(getUserInfo());
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error inicializando Keycloak:", error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const updateAuth = () => {
      setIsAuthenticated(isLoggedIn());
      setUser(isLoggedIn() ? getUserInfo() : null);
    };

    keycloak.onAuthSuccess = updateAuth;
    keycloak.onAuthLogout = updateAuth;
    keycloak.onTokenExpired = () => {
      keycloak.updateToken(30).catch(() => {
        setIsAuthenticated(false);
        setUser(null);
      });
    };

    return () => {
      keycloak.onAuthSuccess = null;
      keycloak.onAuthLogout = null;
      keycloak.onTokenExpired = null;
    };
  }, []);

  const value = {
    isAuthenticated,
    user,
    loading,
    keycloak,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
