import Keycloak from 'keycloak-js';

const keycloakConfig = {
  url: 'http://localhost:8088',
  realm: 'el-almacen-de-peliculas-reino', 
  clientId: 'videoClub-app', 
};

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
const login = () => keycloak.login();
const logout = () => keycloak.logout();
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
    // Account Console moderno
    const baseUrl = `${keycloakConfig.url}/realms/${keycloakConfig.realm}/account`;
    const redirectUri = encodeURIComponent('http://localhost:5173/');
    const accountUrl = `${baseUrl}?referrer=${keycloakConfig.clientId}&referrer_uri=${redirectUri}`;
    
    window.open(accountUrl, '_blank');
  } catch (error) {
    console.error('Error abriendo Account Console:', error);
    
    // Fallback - página de cambio de contraseña
    const fallbackUrl = `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/auth?response_type=code&client_id=${keycloakConfig.clientId}&redirect_uri=${encodeURIComponent('http://localhost:5173/')}&kc_action=UPDATE_PASSWORD`;
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