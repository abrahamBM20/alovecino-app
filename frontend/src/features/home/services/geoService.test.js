import { httpClient } from '../../../shared/api/httpClient';
import { fetchNearbyStores, mapGeoStore } from './geoService';

jest.mock('../../../shared/api/httpClient', () => ({
  httpClient: {
    get: jest.fn(),
  },
}));

describe('geoService', () => {
  it('mapea la respuesta del geo-service al modelo usado por el mapa', () => {
    expect(mapGeoStore({
      id_almacen: 7,
      nombre: 'Almacén Central',
      latitud: '-33.4488900',
      longitud: '-70.6692650',
      distancia_metros: 214,
      distancia_km: 0.214,
      comuna: 'Santiago',
      region: 'Metropolitana',
    })).toEqual({
      id: 7,
      name: 'Almacén Central',
      latitude: -33.44889,
      longitude: -70.669265,
      distanceMeters: 214,
      distanceKm: 0.214,
      comuna: 'Santiago',
      region: 'Metropolitana',
    });
  });

  it('carga almacenes cercanos con el radio solicitado', async () => {
    httpClient.get.mockResolvedValueOnce({
      data: [
        {
          id_almacen: 7,
          nombre: 'Almacén Central',
          latitud: '-33.4488900',
          longitud: '-70.6692650',
          distancia_metros: 214,
          distancia_km: 0.214,
          comuna: 'Santiago',
          region: 'Metropolitana',
        },
      ],
    });

    const stores = await fetchNearbyStores({
      latitude: -33.44889,
      longitude: -70.669265,
      radiusMeters: 500,
    });

    expect(httpClient.get).toHaveBeenCalledWith('/api/geo/stores', {
      params: {
        latitud: -33.44889,
        longitud: -70.669265,
        radio_metros: 500,
      },
    });
    expect(stores).toEqual([
      {
        id: 7,
        name: 'Almacén Central',
        latitude: -33.44889,
        longitude: -70.669265,
        distanceMeters: 214,
        distanceKm: 0.214,
        comuna: 'Santiago',
        region: 'Metropolitana',
      },
    ]);
  });

  it('descarta almacenes sin coordenadas validas antes de renderizar markers', async () => {
    httpClient.get.mockResolvedValueOnce({
      data: [
        {
          id_almacen: 7,
          nombre: 'Almacén Central',
          latitud: '-33.4488900',
          longitud: '-70.6692650',
          distancia_metros: 214,
          distancia_km: 0.214,
          comuna: 'Santiago',
          region: 'Metropolitana',
        },
        {
          id_almacen: 8,
          nombre: 'Almacén sin coordenadas',
          latitud: null,
          longitud: null,
          distancia_metros: null,
          distancia_km: null,
          comuna: 'Santiago',
          region: 'Metropolitana',
        },
        {
          id_almacen: 9,
          nombre: 'Almacén con coordenada inválida',
          latitud: 'no-es-latitud',
          longitud: '-70.6692650',
          distancia_metros: 250,
          distancia_km: 0.25,
          comuna: 'Santiago',
          region: 'Metropolitana',
        },
      ],
    });

    const stores = await fetchNearbyStores({
      latitude: -33.44889,
      longitude: -70.669265,
      radiusMeters: 500,
    });

    expect(stores).toHaveLength(1);
    expect(stores[0].id).toBe(7);
  });

  it('retorna una lista vacia cuando el geo-service no encuentra almacenes dentro del radio', async () => {
    httpClient.get.mockResolvedValueOnce({ data: [] });

    const stores = await fetchNearbyStores({
      latitude: -33.44889,
      longitude: -70.669265,
      radiusMeters: 500,
    });

    expect(stores).toEqual([]);
  });
});
