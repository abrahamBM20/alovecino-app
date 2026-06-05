import { httpClient } from '../../../shared/api/httpClient';
import { fetchAlmacenPerfil, fetchMisAlmacenes, mapAlmacen } from './almacenService';

jest.mock('../../../shared/api/httpClient', () => ({
  httpClient: {
    get: jest.fn(),
  },
}));

describe('almacenService almacenero', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('mapea el almacén con dirección, teléfono e imagen', () => {
    expect(mapAlmacen({
      idAlmacen: 7,
      nombre: 'Almacén Los Queltehues',
      estado: 'PENDIENTE',
      imagenUrl: 'https://cdn.test/logo.png',
      telefono: '+56912345678',
      calle: 'Pasaje Los Queltehues',
      numero: '1234',
      comuna: 'Peñalolén',
      region: 'Metropolitana',
      latitud: '-33.4889',
      longitud: '-70.5441',
    })).toEqual({
      id: 7,
      nombre: 'Almacén Los Queltehues',
      estado: 'PENDIENTE',
      imagenUrl: 'https://cdn.test/logo.png',
      telefono: '+56912345678',
      calle: 'Pasaje Los Queltehues',
      numero: '1234',
      comuna: 'Peñalolén',
      region: 'Metropolitana',
      latitud: '-33.4889',
      longitud: '-70.5441',
      direccion: 'Pasaje Los Queltehues 1234, Peñalolén, Metropolitana',
    });
  });

  it('carga mis almacenes desde el endpoint protegido', async () => {
    httpClient.get.mockResolvedValueOnce({
      data: [{ idAlmacen: 7, nombre: 'Almacén Test', calle: 'A', numero: '1' }],
    });

    const response = await fetchMisAlmacenes();

    expect(httpClient.get).toHaveBeenCalledWith('/api/almacenes/mis-almacenes');
    expect(response).toHaveLength(1);
    expect(response[0]).toMatchObject({ id: 7, nombre: 'Almacén Test' });
  });

  it('carga el perfil de un almacén específico', async () => {
    httpClient.get.mockResolvedValueOnce({
      data: { idAlmacen: 9, nombre: 'Perfil Real' },
    });

    await expect(fetchAlmacenPerfil(9)).resolves.toMatchObject({
      id: 9,
      nombre: 'Perfil Real',
    });
    expect(httpClient.get).toHaveBeenCalledWith('/api/almacenes/9');
  });
});
