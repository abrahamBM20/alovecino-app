import { httpClient } from '../../../shared/api/httpClient';

export async function createAlmacenService(payload) {
  const { data } = await httpClient.post('/api/almacenes', {
    nombre: payload.nombre,
    direccion: {
      calle: payload.calle,
      numero: payload.numero,
      comuna: payload.comuna,
      region: payload.region,
      codigoPostal: payload.codigoPostal || null,
    },
    telefono: payload.telefono,
  });

  return data;
}
