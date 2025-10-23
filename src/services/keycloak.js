import Keycloak from 'keycloak-js';

const keycloakConfig = {
  url: 'http://localhost:8088',
  realm: 'El-Almacén-de-Películas', 
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
};