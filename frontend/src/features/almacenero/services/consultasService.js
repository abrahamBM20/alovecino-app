import { httpClient } from '../../../shared/api/httpClient';

export const mockConsultas = [
  {
    id: '1',
    pregunta: '¿Tienen arroz integral en stock?',
    estado: 'respondida',
    cantidad: 2,
    fecha: 'Ayer · 3:10 p. m.',
    cliente: 'Juan Pérez',
    respuesta: 'Sí, tenemos disponible. Mañana llegará más stock.',
  },
  {
    id: '2',
    pregunta: 'Necesito leche deslactosada, ¿la tienen?',
    estado: 'pendiente',
    cantidad: 4,
    fecha: 'Hoy · 5:34 p. m.',
    cliente: 'María González',
    respuesta: null,
  },
  {
    id: '3',
    pregunta: 'Consulta sobre aceite vegetal de 5 litros',
    estado: 'cerrada',
    cantidad: 1,
    fecha: '23 may · 9:00 a. m.',
    cliente: 'Pedro López',
    respuesta: 'Lamentablemente no contamos con esa presentación.',
  },
  {
    id: '4',
    pregunta: 'Necesito saber si tienen azúcar morena',
    estado: 'pendiente',
    cantidad: 3,
    fecha: 'Hoy · 10:32 a. m.',
    cliente: 'Ana Torres',
    respuesta: null,
  },
  {
    id: '5',
    pregunta: '¿Tienen pan de molde integral?',
    estado: 'respondida',
    cantidad: 2,
    fecha: 'Ayer · 8:15 a. m.',
    cliente: 'Carlos Ruiz',
    respuesta: 'Sí, tenemos en presentación de 500g.',
  },
];

export function actualizarConsultaMock(id, estado, respuesta = null) {
  const idx = mockConsultas.findIndex((c) => c.id === String(id));
  if (idx >= 0) {
    mockConsultas[idx] = { ...mockConsultas[idx], estado, respuesta };
  }
}

export async function fetchConsultasAlmacenero(idAlmacen) {
  const { data } = await httpClient.get(`/api/almacenes/${idAlmacen}/consultas`);
  return data.map((consulta) => ({
    ...consulta,
    cliente: consulta.usuario?.nombre ?? consulta.clienteNombre ?? 'Cliente',
  }));
}

export async function fetchEstadisticasAlmacenero(idAlmacen) {
  const { data } = await httpClient.get(`/api/almacenes/${idAlmacen}/consultas/estadisticas`);
  return data;
}

export async function responderConsulta(idConsulta, respuesta) {
  const { data } = await httpClient.put(`/api/consultas/${idConsulta}/responder`, { respuesta });
  return data;
}

export async function cerrarConsulta(idConsulta) {
  const { data } = await httpClient.put(`/api/consultas/${idConsulta}/cerrar`);
  return data;
}
