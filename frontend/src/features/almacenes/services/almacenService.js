import { httpClient } from '../../../shared/api/httpClient';
import { useAuthStore } from '../../../store/authStore';

export async function createAlmacenService(payload) {
  const token = useAuthStore.getState().accessToken;
  const { data } = await httpClient.post('/api/almacenes', {
    nombre: payload.nombre,
    direccion: payload.direccion,
    comuna: payload.comuna,
    telefono: payload.telefono,
  }, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  return data;
}
