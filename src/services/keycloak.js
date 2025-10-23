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

// Inicializar Keycloak
const initKeycloak = () => {
  return keycloak.init(initOptions);
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