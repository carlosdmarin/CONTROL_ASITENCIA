import axios from 'axios';

// URL base de tu backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos
});

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.config?.url, error.message);
    
    // Mensaje de error amigable
    if (error.code === 'ECONNABORTED') {
      error.userMessage = 'La conexión ha tardado demasiado. Verifica tu conexión.';
    } else if (error.response?.status === 404) {
      error.userMessage = 'El recurso solicitado no existe.';
    } else if (error.response?.status === 500) {
      error.userMessage = 'Error en el servidor. Intenta más tarde.';
    } else if (!error.response) {
      error.userMessage = 'No se pudo conectar al servidor. ¿Está corriendo el backend?';
    }
    
    return Promise.reject(error);
  }
);

// Helper para manejar errores en los componentes
export const handleApiError = (error: unknown): string => {
  console.error('API Error:', error);
  
  const axiosError = error as { userMessage?: string; response?: { data?: { message?: string; error?: string } } };
  
  if (axiosError.userMessage) {
    return axiosError.userMessage;
  }
  
  if (axiosError.response?.data?.message) {
    return axiosError.response.data.message;
  }
  
  if (axiosError.response?.data?.error) {
    return axiosError.response.data.error;
  }
  
  return 'Ocurrió un error inesperado.';
};