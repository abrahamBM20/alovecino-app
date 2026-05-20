import { httpClient } from '../../../shared/api/httpClient';
import { API_BASE_URL } from '../../../config/environment';

export const DEFAULT_RADIUS_METERS = 500;
export const RADIUS_OPTIONS = [200, 500, 1000, 2000];

function isMockEnvironment() {
  return API_BASE_URL.includes('example.com');
}

const mockStores = [
  {
    id: 1,
    name: 'Minimarket Don Pedro',
    latitude: -33.4489,
    longitude: -70.6693,
    distanceMeters: 120,
    distanceKm: 0.12,
    comuna: 'Santiago',
    region: 'Metropolitana de Santiago',
  },
  {
    id: 2,
    name: 'Almacén La Esquina',
    latitude: -33.4502,
    longitude: -70.6710,
    distanceMeters: 340,
    distanceKm: 0.34,
    comuna: 'Santiago',
    region: 'Metropolitana de Santiago',
  },
];

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function mapGeoStore(apiStore) {
  return {
    id: apiStore.id_almacen,
    name: apiStore.nombre,
    latitude: toNumber(apiStore.latitud),
    longitude: toNumber(apiStore.longitud),
    distanceMeters: apiStore.distancia_metros,
    distanceKm: apiStore.distancia_km,
    comuna: apiStore.comuna,
    region: apiStore.region,
  };
}

export async function fetchNearbyStores({ latitude, longitude, radiusMeters = DEFAULT_RADIUS_METERS }) {
  if (isMockEnvironment()) {
    return mockStores;
  }

  const { data } = await httpClient.get('/api/geo/stores', {
    params: {
      latitud: latitude,
      longitud: longitude,
      radio_metros: radiusMeters,
    },
  });

  return data
    .map(mapGeoStore)
    .filter((store) => store.latitude !== null && store.longitude !== null);
}
