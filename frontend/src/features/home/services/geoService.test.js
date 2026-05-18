import { mapGeoStore } from './geoService';

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
});
