import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:20000/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para inyectar automáticamente el Token JWT en el encabezado
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// =========================================================================
// 1. ENDPOINTS PRIVADOS DEL ATLETA (MI PERFIL - Basados en el Token/Usuario)
// =========================================================================

// Obtener mi currículum personal
export const getMiCurriculumRequest = () => 
  API.get("/atleta/mi-curriculum");

// Crear o Actualizar mi currículum personal (Upsert todo en uno)
export const saveMiCurriculumRequest = (fullData) => 
  API.post("/atleta/mi-curriculum", fullData);

// Eliminar mi currículum personal
export const deleteMiCurriculumRequest = () => 
  API.delete("/atleta/mi-curriculum");

// =========================================================================
// 2. ENDPOINTS ADMINISTRATIVOS O PÚBLICOS (Gestión por ID)
// =========================================================================

// Listado general de atletas
export const getAtletasRequest = (page = 1, limit = 200) =>
  API.get(`/atletas?page=${page}&limit=${limit}`);

// Obtener currículum completo por ID de atleta
export const getAtletaCurriculumRequest = (id) =>
  API.get(`/atletas/${id}/curriculum`);

// Crear atleta desde panel administrativo
export const createAtletaRequest = (fullData) =>
  API.post("/atletas", fullData);

// Actualizar atleta por ID
export const updateAtletaRequest = (id, fullData) =>
  API.put(`/atletas/${id}`, fullData);

// Eliminar atleta por ID
export const deleteAtletaRequest = (id) =>
  API.delete(`/atletas/${id}`);

// =========================================================================
// 3. OPERACIONES MASIVAS
// =========================================================================

// Ejecución masiva concurrente de múltiples peticiones en paralelo
export const fetchMultipleCurriculums = async (ids = []) => {
  const requests = ids.map((id) => API.get(`/atletas/${id}/curriculum`));
  const responses = await Promise.all(requests);
  return responses.map((res) => res.data);
};

// Obtener currículum completo buscando por el ID de Usuario
export const getCurriculumByUserIdRequest = (usuarioId) =>
  API.get(`/atletas/usuario/${usuarioId}/curriculum`);