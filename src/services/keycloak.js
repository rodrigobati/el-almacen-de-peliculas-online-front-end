import Keycloak from 'keycloak-js';
import { APP_CONFIG } from '../config/env.js';

const keycloakConfig = {
  url: APP_CONFIG.keycloak.url,
  realm: APP_CONFIG.keycloak.realm,
  clientId: APP_CONFIG.keycloak.clientId,
};

const keycloakRedirectUri = APP_CONFIG.keycloak.redirectUri;

// Crear instancia de Keycloak
const keycloak = new Keycloak(keycloakConfig);

// Opciones de inicialización
const initOptions = {
  onLoad: 'check-sso',
  checkLoginIframe: false,
};

// Variable para controlar si ya se inicializó
let isInitialized = false;
let initPromise = null;

// Inicializar Keycloak (solo una vez)
const initKeycloak = () => {
  // Si ya está inicializado o en proceso, retornar la promesa existente
  if (isInitialized) {
    return Promise.resolve(keycloak.authenticated || false);
  }
  
  if (initPromise) {
    return initPromise;
  }

  initPromise = keycloak.init(initOptions)
    .then((authenticated) => {
      isInitialized = true;
      return authenticated;
    })
    .catch((error) => {
      console.error('Error al inicializar Keycloak:', error);
      isInitialized = false;
      initPromise = null;
      throw error;
    });

  return initPromise;
};

// Funciones de autenticación
const login = () => keycloak.login({ redirectUri: keycloakRedirectUri });
const logout = () => keycloak.logout({ redirectUri: keycloakRedirectUri });
const getToken = () => keycloak.token;
const isLoggedIn = () => !!keycloak.token;
const updateToken = (successCallback) => keycloak.updateToken(5).then(successCallback).catch(login);
const getUsername = () => keycloak.tokenParsed?.preferred_username;
const getUserInfo = () => keycloak.tokenParsed;

// Función para abrir Account Management Console
const openAccountManagement = () => {
  if (!keycloak.authenticated) {
    console.error('Usuario no autenticado');
    return;
  }

  try {
    const accountUrl = typeof keycloak.createAccountUrl === 'function'
      ? keycloak.createAccountUrl({ redirectUri: keycloakRedirectUri })
      : `${keycloakConfig.url}/realms/${keycloakConfig.realm}/account?referrer=${keycloakConfig.clientId}&referrer_uri=${encodeURIComponent(keycloakRedirectUri)}`;

    window.open(accountUrl, '_blank');
  } catch (error) {
    console.error('Error abriendo Account Console:', error);

    // Fallback - página de cambio de contraseña
    const fallbackUrl = `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/auth?response_type=code&client_id=${keycloakConfig.clientId}&redirect_uri=${encodeURIComponent(keycloakRedirectUri)}&kc_action=UPDATE_PASSWORD`;
    window.open(fallbackUrl, '_blank');
  }
};

export {
  keycloak,
  initKeycloak,
  login,
  logout,
  getToken,
  isLoggedIn,
  updateToken,
  getUsername,
  getUserInfo,
  openAccountManagement,
};