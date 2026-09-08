import API from "../services/api/axios";

// Servicio para Iniciar Sesión
export const loginRequest = async (username, password) => {
  try {
    const response = await API.post("/api/login", { username, password });
    return response.data;
  } catch (error) {
    // Retorna el mensaje de error personalizado enviado desde el servidor
    throw error.response?.data?.message || "Error al conectar con el servidor";
  }
};

// Servicio para verificar si el Token sigue activo
export const verifyTokenRequest = async () => {
  try {
    const response = await API.get("/api/verify-token");
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Sesión expirada o no válida";
  }
};

// Función helper para Cerrar Sesión desde el Frontend
export const logoutService = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};