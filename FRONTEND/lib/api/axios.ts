// lib/api/axios.ts
import axios from 'axios';

// URL base de tu backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos
  withCredentials: true,
});

// CSRF para entorno cross-origin: la cookie XSRF-TOKEN del backend no es legible
// via document.cookie (dominio distinto), por eso se obtiene via GET /api/csrf (JSON)
// y se guarda en memoria para enviar como X-XSRF-TOKEN
let csrfToken: string | null = null;
let csrfPromise: Promise<string> | null = null;

export async function fetchCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;
  if (csrfPromise) return csrfPromise;
  csrfPromise = fetch(`${API_URL}/csrf`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  })
    .then(async (res) => {
      if (!res.ok) throw new Error(`CSRF fetch ${res.status}`);
      const data = await res.json();
      const t = data.token || data.csrf || data.value;
      if (!t) throw new Error('CSRF token missing');
      csrfToken = t;
      return t;
    })
    .finally(() => {
      csrfPromise = null;
    });
  return csrfPromise;
}

export function clearCsrfToken() {
  csrfToken = null;
  csrfPromise = null;
}

// Interceptor de request: añade X-XSRF-TOKEN en mutaciones (POST/PUT/PATCH/DELETE)
// excepto rutas ignoradas por backend (/api/auth/** y /api/csrf)
api.interceptors.request.use(async (config) => {
  const method = (config.method || '').toLowerCase();
  const url = config.url || '';
  const isMutating = ['post', 'put', 'patch', 'delete'].includes(method);
  const isIgnored =
    url.includes('/api/auth/') ||
    url.includes('/auth/') ||
    url.includes('/api/csrf') ||
    url.includes('/csrf');
  if (isMutating && !isIgnored) {
    try {
      const token = await fetchCsrfToken();
      if (token) {
        config.headers = config.headers || {};
        (config.headers as any)['X-XSRF-TOKEN'] = token;
      }
    } catch (e) {
      console.warn('No se pudo obtener CSRF token', e);
    }
  }
  return config;
});

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.config?.url, error.message);
    console.error('❌ Status:', error.response?.status);
    console.error('❌ Response Data:', error.response?.data);
    
    // Extraer mensaje del error
    let mensaje = 'Ocurrió un error inesperado.';
    
    if (error.response) {
      const data = error.response.data;
      
      // Si el backend devuelve un objeto con mensaje
      if (data && typeof data === 'object') {
        mensaje = data.message || data.error || data.mensaje || data.msg;
        
        // Si no hay mensaje, intentar extraer de otras propiedades
        if (!mensaje) {
          // Si es un string
          if (typeof data === 'string') {
            mensaje = data;
          } else {
            // Si es un objeto, convertirlo a string
            mensaje = JSON.stringify(data);
          }
        }
      } else if (typeof data === 'string') {
        mensaje = data;
      }
      
      // Si es error 500 y no hay mensaje específico
      if (error.response.status === 500 && !mensaje) {
        mensaje = 'Error interno del servidor. Revisa los logs del backend.';
      }
    } else if (error.code === 'ECONNABORTED') {
      mensaje = 'La conexión ha tardado demasiado. Verifica tu conexión.';
    } else if (!error.response) {
      mensaje = 'No se pudo conectar al servidor. ¿Está corriendo el backend?';
    }
    
    // Crear un error mejorado
    const enhancedError = new Error(mensaje);
    (enhancedError as any).status = error.response?.status;
    (enhancedError as any).data = error.response?.data;
    (enhancedError as any).originalError = error;
    
    return Promise.reject(enhancedError);
  }
);

// Helper para manejar errores en los componentes
export const handleApiError = (error: unknown): string => {
  console.error('API Error:', error);
  
  // Si es nuestro error mejorado
  if (error instanceof Error) {
    return error.message;
  }
  
  // Si es un error de Axios
  const axiosError = error as any;
  if (axiosError.response?.data?.message) {
    return axiosError.response.data.message;
  }
  if (axiosError.response?.data?.error) {
    return axiosError.response.data.error;
  }
  
  return 'Ocurrió un error inesperado.';
};

export default api;