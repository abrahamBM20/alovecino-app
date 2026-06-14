import { httpClient } from '../../../shared/api/httpClient';

const ESTADO_BY_ID = {
  1: 'pendiente',
  2: 'respondida',
  3: 'cerrada',
  4: 'cancelada',
};

const ESTADO_BY_NAME = {
  PENDIENTE: 'pendiente',
  RESPONDIDA: 'respondida',
  CERRADA: 'cerrada',
  CANCELADA: 'cerrada',
};

function formatFecha(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('es-CL', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function mapConsulta(apiConsulta) {
  const estadoNombre = apiConsulta.estadoNombre?.toUpperCase?.();
  const estado = ESTADO_BY_NAME[estadoNombre] ?? ESTADO_BY_ID[apiConsulta.idEstadoConsulta] ?? 'pendiente';
  const detalles = Array.isArray(apiConsulta.detalles) ? apiConsulta.detalles : [];
  const primerDetalle = detalles[0];

  return {
    id: String(apiConsulta.idConsulta),
    idConsulta: apiConsulta.idConsulta,
    pregunta: primerDetalle?.descripcion ?? apiConsulta.descripcion,
    estado,
    estadoNombre: apiConsulta.estadoNombre,
    idEstadoConsulta: apiConsulta.idEstadoConsulta,
    cantidad: primerDetalle?.cantidadSolicitada ?? apiConsulta.cantidad ?? 0,
    fecha: formatFecha(apiConsulta.createdAt),
    cliente: apiConsulta.clienteNombre ?? `Cliente #${apiConsulta.idCliente ?? '-'}`,
    idCliente: apiConsulta.idCliente,
    respuesta: apiConsulta.respuesta,
    fechaRespuesta: apiConsulta.fechaRespuesta,
    detalles,
    createdAt: apiConsulta.createdAt,
  };
}

export async function fetchConsultasAlmacenero(idAlmacen) {
  const { data } = await httpClient.get(`/api/consultas/almacen/${idAlmacen}`);
  return Array.isArray(data) ? data.map(mapConsulta) : [];
}

export async function fetchDashboardAlmacenero(idAlmacen) {
  const { data } = await httpClient.get(`/api/consultas/almacen/${idAlmacen}/dashboard`);
  return {
    ...data,
    consultasRecientes: Array.isArray(data?.consultasRecientes)
      ? data.consultasRecientes.map(mapConsulta)
      : [],
  };
}

export async function fetchEstadosConsulta() {
  const { data } = await httpClient.get('/api/estados-consulta');
  return data;
}

export async function responderConsulta(idConsulta, respuesta, idEstadoConsulta = null) {
  const payload = idEstadoConsulta ? { respuesta, idEstadoConsulta } : { respuesta };
  const { data } = await httpClient.put(`/api/consultas/${idConsulta}/responder`, payload);
  return data;
}

export async function cerrarConsulta(idConsulta) {
  const estados = await fetchEstadosConsulta();
  const cerrada = estados.find((estado) => estado.nombre === 'CERRADA');
  const idEstadoConsulta = cerrada?.idEstadoConsulta ?? 3;
  const { data } = await httpClient.put(`/api/consultas/${idConsulta}/estado`, null, {
    params: { idEstadoConsulta },
  });
  return data;
}
