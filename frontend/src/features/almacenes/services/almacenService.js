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

export async function getMisAlmacenes() {
  const { data } = await httpClient.get('/api/almacenes/mis-almacenes');
  return data;
}

export async function getConsultasRecientes(idAlmacen) {
  const { data } = await httpClient.get(`/api/consultas/almacen/${idAlmacen}`);
  return data;
}

export async function getEstadisticasAlmacen(idAlmacen) {
  const { data } = await httpClient.get(
    `/api/consultas/almacen/${idAlmacen}/estadisticas`
  );
  return data;
}

export async function responderConsulta(idConsulta, respuesta, idEstadoConsulta) {
  const { data } = await httpClient.put(
    `/api/consultas/${idConsulta}/responder`,
    {
      respuesta,
      idEstadoConsulta,
    }
  );
  return data;
}

export async function cambiarEstadoAlmacen(idAlmacen, estado) {
  const { data } = await httpClient.put(
    `/api/almacenes/${idAlmacen}/estado`,
    { estado }
  );
  return data;
}
