import { httpClient } from '../../../shared/api/httpClient';
import { fetchAlmacenPerfil, fetchMisAlmacenes, mapAlmacen, updateAlmacenPerfil } from './almacenService';

jest.mock('../../../shared/api/httpClient', () => ({
  httpClient: {
    get: jest.fn(),
    patch: jest.fn(),
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
      codigoPostal: '7910000',
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
      codigoPostal: '7910000',
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

  it('actualiza el perfil del almacén con el contrato normalizado', async () => {
    const payload = {
      nombre: 'Botillería Queltehues Sur',
      telefono: '+56911112222',
      direccion: {
        calle: 'Pasaje Los Queltehues',
        numero: '1450',
        comuna: 'Peñalolén',
        region: 'Metropolitana de Santiago',
        codigoPostal: '7910000',
      },
    };
    httpClient.patch.mockResolvedValueOnce({
      data: {
        idAlmacen: 9,
        nombre: payload.nombre,
        telefono: payload.telefono,
        calle: payload.direccion.calle,
        numero: payload.direccion.numero,
        codigoPostal: payload.direccion.codigoPostal,
        comuna: payload.direccion.comuna,
        region: payload.direccion.region,
      },
    });

    await expect(updateAlmacenPerfil(9, payload)).resolves.toMatchObject({
      id: 9,
      nombre: payload.nombre,
      telefono: payload.telefono,
      codigoPostal: payload.direccion.codigoPostal,
    });
    expect(httpClient.patch).toHaveBeenCalledWith('/api/almacenes/9', payload);
  });
});
