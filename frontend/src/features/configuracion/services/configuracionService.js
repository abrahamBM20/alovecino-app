import { httpClient } from '../../../shared/api/httpClient';
import { useAuthStore } from '../../../store/authStore';
import { API_BASE_URL } from '../../../config/environment';

function isMockEnvironment() {
  return API_BASE_URL.includes('example.com');
}

function authHeaders() {
  const token = useAuthStore.getState().accessToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const mockConfig = {
  notificacionesPush: true,
  notificacionesEmail: true,
  recibirOfertas: false,
  perfilVisible: true,
  radioOfertasKm: 1.0,
};

export async function getConfiguracion(idUsuario) {
  if (isMockEnvironment()) {
    return { ...mockConfig };
  }

  const { data } = await httpClient.get(`/api/configuracion/${idUsuario}`, {
    headers: authHeaders(),
  });
  return data;
}

export async function updateConfiguracion(idUsuario, payload) {
  if (isMockEnvironment()) {
    Object.assign(mockConfig, payload);
    return { ...mockConfig };
  }

  const { data } = await httpClient.put(`/api/configuracion/${idUsuario}`, payload, {
    headers: authHeaders(),
  });
  return data;
}
