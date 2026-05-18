import { httpClient } from '../../../shared/api/httpClient';
import { useAuthStore } from '../../../store/authStore';
import { fetchNearbyAlmacenesLocal } from './geoService.local';

const USE_LOCAL_GEO = process.env.EXPO_PUBLIC_USE_LOCAL_GEO === 'true';

export async function fetchNearbyAlmacenes({ lat, lng, radioKm = 5 }) {
  if (USE_LOCAL_GEO) {
    return fetchNearbyAlmacenesLocal({ lat, lng, radioKm });
  }

  const token = useAuthStore.getState().accessToken;
  const { data } = await httpClient.get('/api/v1/almacenes/busqueda-espacial', {
    params: {
      lat,
      lng,
      radioKm,
    },
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  return data;
}
