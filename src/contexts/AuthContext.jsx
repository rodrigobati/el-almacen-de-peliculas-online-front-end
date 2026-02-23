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

// Recognize common admin role names (Keycloak realm/resource roles or SPRING authorities)
// Match case-insensitively. Do not assume a single canonical name from Keycloak.
const ADMIN_ROLE_ALIASES = ["admin", "role_admin"];


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
  const [tokenParsed, setTokenParsed] = useState(null);
  const [loading, setLoading] = useState(true);
  const isDev = import.meta.env?.DEV;

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let isMounted = true; // Flag para evitar actualizaciones si el componente se desmonta

    initKeycloak()
      .then((authenticated) => {
        if (isMounted) {
          setIsAuthenticated(authenticated);
          if (authenticated) {
            setUser(getUserInfo());
            setToken(keycloak.token || null);
            setTokenParsed(keycloak.tokenParsed || null);
          } else {
            setToken(null);
            setTokenParsed(null);
          }
          setLoading(false);
          setInitialized(true);
        }
      })
      .catch((error) => {
        console.error("Error inicializando Keycloak:", error);
        if (isMounted) {
          setLoading(false);
          setInitialized(true);
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
      setTokenParsed(authenticated ? keycloak.tokenParsed || null : null);
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

  // Derive roles from the parsed token (JWT claims), not from userInfo.
  // keycloak.tokenParsed contains `realm_access` and `resource_access` claims.
  const roles = extractRoles(tokenParsed);

  const hasRole = (roleName) => Array.isArray(roles) && roles.includes(roleName);

  const hasAdminRole = (rolesList) => {
    if (!Array.isArray(rolesList)) return false;
    return rolesList.some((r) => {
      if (typeof r !== "string") return false;
      const lower = r.toLowerCase();
      return ADMIN_ROLE_ALIASES.includes(lower);
    });
  };

  const isAdmin = hasAdminRole(roles);

  // Contract: cualquier consumidor de useAuth() recibe siempre token/roles/user sincronizados.
  const value = {
    isAuthenticated,
    user,
    token,
    roles,
    loading, // existing contract: `loading` used across app to hide links while init in progress
    authInitialized: initialized, // new: explicitly indicate Keycloak init completed
    keycloak,
    hasRole,
    hasAdminRole,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
