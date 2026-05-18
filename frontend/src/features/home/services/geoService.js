import { httpClient } from '../../../shared/api/httpClient';

export const DEFAULT_RADIUS_METERS = 500;
export const RADIUS_OPTIONS = [200, 500, 1000, 2000];

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
