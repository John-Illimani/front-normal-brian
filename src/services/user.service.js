import API from '../services/api/axios';

export const getUsersRequest = async () => {
  const response = await API.get('/api/usuarios');
  return response.data;
};

export const createUserRequest = async (userData) => {
  const response = await API.post('/api/usuarios', userData);
  return response.data;
};

// Nueva función de actualización
export const updateUserRequest = async (id, userData) => {
  const response = await API.put(`/api/usuarios/${id}`, userData);
  return response.data;
};

export const toggleStatusRequest = async (id, activo) => {
  const response = await API.patch(`/api/usuarios/${id}/status`, { activo });
  return response.data;
};

export const deleteUserRequest = async (id) => {
  const response = await API.delete(`/api/usuarios/${id}`);
  return response.data;
};



// Eliminar múltiples usuarios por lote (IDs array)
export const deleteMultipleUsersRequest = async (ids) => {
  const response = await API.post('/api/usuarios/delete-batch', { ids });
  return response.data;
};