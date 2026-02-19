import React, { createContext, useContext, useState, useEffect } from "react";
import {
  initKeycloak,
  keycloak,
  isLoggedIn,
  getUserInfo,
} from "../services/keycloak";

const AuthContext = createContext();

function extractRoles(userInfo) {
  if (!userInfo) {
    return [];
  }

  const realmRoles = Array.isArray(userInfo?.realm_access?.roles)
    ? userInfo.realm_access.roles
    : [];

  const resourceRoles = Object.values(userInfo?.resource_access || {})
    .flatMap((resource) => (Array.isArray(resource?.roles) ? resource.roles : []));

  return [...new Set([...realmRoles, ...resourceRoles])];
}

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
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const isDev = import.meta.env?.DEV;

  useEffect(() => {
    let isMounted = true; // Flag para evitar actualizaciones si el componente se desmonta

    initKeycloak()
      .then((authenticated) => {
        if (isMounted) {
          setIsAuthenticated(authenticated);
          if (authenticated) {
            setUser(getUserInfo());
            setToken(keycloak.token || null);
          } else {
            setToken(null);
          }
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("Error inicializando Keycloak:", error);
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false; // Cleanup function
    };
  }, []);

  useEffect(() => {
    const updateAuth = () => {
      const authenticated = isLoggedIn();
      setIsAuthenticated(authenticated);
      setUser(authenticated ? getUserInfo() : null);
      setToken(authenticated ? keycloak.token || null : null);
    };

    keycloak.onAuthSuccess = updateAuth;
    keycloak.onAuthLogout = updateAuth;
    keycloak.onTokenExpired = () => {
      if (isDev) {
        console.log("TOKEN_REFRESH_START");
      }
      keycloak.updateToken(30)
        .then(() => {
          if (isDev) {
            console.log("TOKEN_REFRESH_OK");
          }
          updateAuth();
        })
        .catch(() => {
          if (isDev) {
            console.error("TOKEN_REFRESH_FAIL");
          }
          setIsAuthenticated(false);
          setUser(null);
          setToken(null);
        });
    };

    return () => {
      keycloak.onAuthSuccess = null;
      keycloak.onAuthLogout = null;
      keycloak.onTokenExpired = null;
    };
  }, []);

  const roles = extractRoles(user);

  // Contract: cualquier consumidor de useAuth() recibe siempre token/roles/user sincronizados.
  const value = {
    isAuthenticated,
    user,
    token,
    roles,
    loading,
    keycloak,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
