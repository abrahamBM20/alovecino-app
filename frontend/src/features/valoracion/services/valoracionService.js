import { httpClient } from '../../../shared/api/httpClient';
import { API_BASE_URL } from '../../../config/environment';

function isMockEnvironment() {
  return API_BASE_URL.includes('example.com');
}

const mockValoraciones = [
  {
    idValoracion: 1,
    cantidadEstrellas: 5,
    contenido: 'Excelente servicio y productos frescos.',
    idCliente: 1,
    idAlmacen: 1,
    fechaCreacion: '2026-05-01T10:00:00Z',
    fechaActualizacion: '2026-05-01T10:00:00Z',
  },
  {
    idValoracion: 2,
    cantidadEstrellas: 4,
    contenido: 'Muy buena atención.',
    idCliente: 2,
    idAlmacen: 1,
    fechaCreacion: '2026-05-05T15:00:00Z',
    fechaActualizacion: '2026-05-05T15:00:00Z',
  },
];

export async function getValoracionesByAlmacen(idAlmacen) {
  if (isMockEnvironment()) {
    return mockValoraciones.filter((v) => v.idAlmacen === Number(idAlmacen));
  }
  const { data } = await httpClient.get(`/api/valoraciones/almacen/${idAlmacen}`);
  return data;
}

export async function createValoracion(payload) {
  if (isMockEnvironment()) {
    const nueva = {
      idValoracion: Date.now(),
      idCliente: 1,
      ...payload,
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
    };
    mockValoraciones.push(nueva);
    return nueva;
  }
  const { data } = await httpClient.post('/api/valoraciones', payload);
  return data;
}

export async function updateValoracion(idValoracion, payload) {
  if (isMockEnvironment()) {
    const idx = mockValoraciones.findIndex((v) => v.idValoracion === idValoracion);
    if (idx !== -1) {
      mockValoraciones[idx] = { ...mockValoraciones[idx], ...payload, fechaActualizacion: new Date().toISOString() };
      return mockValoraciones[idx];
    }
    throw new Error('Valoración no encontrada');
  }
  const { data } = await httpClient.put(`/api/valoraciones/${idValoracion}`, payload);
  return data;
}

export async function deleteValoracion(idValoracion) {
  if (isMockEnvironment()) {
    const idx = mockValoraciones.findIndex((v) => v.idValoracion === idValoracion);
    if (idx !== -1) mockValoraciones.splice(idx, 1);
    return;
  }
  await httpClient.delete(`/api/valoraciones/${idValoracion}`);
}

export async function getMisValoraciones() {
  if (isMockEnvironment()) {
    return mockValoraciones.filter((v) => v.idCliente === 1);
  }
  const { data } = await httpClient.get('/api/valoraciones/mis-valoraciones');
  return data;
}
