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
  CANCELADA: 'cancelada',
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

function mapDetalles(detalles = []) {
  return Array.isArray(detalles)
    ? detalles.map((detalle) => ({
      id: String(detalle.idConsultaDetalle ?? `${detalle.descripcion}-${detalle.cantidadSolicitada}`),
      descripcion: detalle.descripcion ?? '',
      cantidadSolicitada: detalle.cantidadSolicitada ?? 0,
    }))
    : [];
}

export function mapConsultaCliente(apiConsulta) {
  const estadoNombre = apiConsulta.estadoNombre?.toUpperCase?.();
  const detalles = mapDetalles(apiConsulta.detalles);
  const primerDetalle = detalles[0];

  return {
    id: String(apiConsulta.idConsulta),
    idConsulta: apiConsulta.idConsulta,
    idCliente: apiConsulta.idCliente,
    idAlmacen: apiConsulta.idAlmacen,
    nombreAlmacen: apiConsulta.nombreAlmacen,
    estado: ESTADO_BY_NAME[estadoNombre] ?? ESTADO_BY_ID[apiConsulta.idEstadoConsulta] ?? 'pendiente',
    estadoNombre: apiConsulta.estadoNombre,
    idEstadoConsulta: apiConsulta.idEstadoConsulta,
    fecha: formatFecha(apiConsulta.createdAt),
    respuesta: apiConsulta.respuesta,
    fechaRespuesta: formatFecha(apiConsulta.fechaRespuesta),
    detalles,
    resumen: primerDetalle
      ? `${primerDetalle.descripcion} (${primerDetalle.cantidadSolicitada})`
      : 'Consulta sin detalle',
    createdAt: apiConsulta.createdAt,
  };
}

export async function crearConsultaCliente({ idCliente, idAlmacen, detalles }) {
  const payload = {
    idCliente: Number(idCliente),
    idAlmacen: Number(idAlmacen),
    detalles: detalles.map((detalle) => ({
      descripcion: detalle.descripcion.trim(),
      cantidadSolicitada: Number(detalle.cantidadSolicitada),
    })),
  };

  const { data } = await httpClient.post('/api/consultas', payload);
  return mapConsultaCliente(data);
}

export async function fetchConsultasCliente(idCliente) {
  const { data } = await httpClient.get(`/api/consultas/cliente/${idCliente}`);
  return Array.isArray(data) ? data.map(mapConsultaCliente) : [];
}
