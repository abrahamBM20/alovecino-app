import axios from 'axios';
import { useAuthStore } from '../../../store/authStore';

// En Windows/desarrollo local: http://localhost:8084
// En emulador Android: http://10.0.2.2:8084
// Desde celular en red local: http://192.168.X.X:8084 (reemplaza con tu IP)
const LOCAL_GEO_BASE_URL = 'http://192.168.100.88:8084';

const localGeoClient = axios.create({
  baseURL: LOCAL_GEO_BASE_URL,
  timeout: 90000,
  headers: {
    'Content-Type': 'application/json',
  },
});

function getAuthHeader() {
  const token = useAuthStore.getState().accessToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchNearbyAlmacenesLocal({ lat, lng, radioKm =30 }) {
  try {
    const headers = getAuthHeader();
    console.log('🌍 GEO LOCAL - Iniciando búsqueda');
    console.log('🌍 GEO LOCAL - URL:', LOCAL_GEO_BASE_URL);
    console.log('🌍 GEO LOCAL - Coordenadas:', { lat, lng, radioKm });
    console.log('🌍 GEO LOCAL - Token presente:', !!headers.Authorization);

    const { data } = await localGeoClient.get('/api/v1/almacenes/busqueda-espacial', {
      params: {
        lat,
        lng,
        radioKm,
      },
      headers,
    });

    console.log('🌍 GEO LOCAL - Respuesta exitosa:', data.length || 0, 'almacenes');
    return data;
  } catch (error) {
    console.error('🌍 GEO LOCAL - Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url,
      headers: error.config?.headers,
    });
    throw error;
  }
}

export async function fetchGeocodeLocal(addressPayload) {
  try {
    const headers = getAuthHeader();
    console.log('🌍 GEO LOCAL - Geocoding:', addressPayload);

    const { data } = await localGeoClient.post('/api/geolocalizacion/geocode', addressPayload, {
      headers,
    });

    console.log('🌍 GEO LOCAL - Geocoding respuesta:', data);
    return data;
  } catch (error) {
    console.error('🌍 GEO LOCAL - Geocoding error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
}

