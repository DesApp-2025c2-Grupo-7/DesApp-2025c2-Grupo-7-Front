// Configuración de la aplicación basada en variables de entorno

interface Config {
  apiBaseUrl: string;
  nodeEnv: string;
}

const getConfig = (): Config => {
  return {
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
    nodeEnv: import.meta.env.VITE_NODE_ENV || 'development'
  };
};

export const config = getConfig();

// Helper function para obtener la URL completa del API
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = config.apiBaseUrl.endsWith('/') 
    ? config.apiBaseUrl.slice(0, -1) 
    : config.apiBaseUrl;
  
  const cleanEndpoint = endpoint.startsWith('/') 
    ? endpoint 
    : `/${endpoint}`;
  
  return `${baseUrl}${cleanEndpoint}`;
};

// Helper para determinar el entorno
export const isDevelopment = () => config.nodeEnv === 'development';
export const isProduction = () => config.nodeEnv === 'production';
export const isTest = () => config.nodeEnv === 'test';

export default config;