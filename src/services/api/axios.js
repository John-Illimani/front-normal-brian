import axios from "axios";

const API = axios.create({
  baseURL: "https://back-normal-brian.vercel.app/", // Cambia esto según el puerto donde corre tu Node.js
  withCredentials: true,
});

// Interceptor para adjuntar automáticamente el JWT Token en cada Petición
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;