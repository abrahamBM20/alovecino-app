import { httpClient } from '../../../shared/api/httpClient';
import {
  cerrarConsulta,
  fetchConsultasAlmacenero,
  fetchDashboardAlmacenero,
  mapConsulta,
  responderConsulta,
} from './consultasService';

jest.mock('../../../shared/api/httpClient', () => ({
  httpClient: {
    get: jest.fn(),
    put: jest.fn(),
  },
}));

describe('consultasService almacenero', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('mapea una consulta real al modelo de UI', () => {
    const response = mapConsulta({
      idConsulta: 5,
      detalles: [
        {
          idConsultaDetalle: 9,
          descripcion: '¿Tiene arroz?',
          cantidadSolicitada: 2,
        },
      ],
      idCliente: 11,
      clienteNombre: 'Ana Pérez',
      idEstadoConsulta: 1,
      estadoNombre: 'PENDIENTE',
      respuesta: null,
      createdAt: '2026-06-03T10:30:00',
    });

    expect(response).toMatchObject({
      id: '5',
      idConsulta: 5,
      pregunta: '¿Tiene arroz?',
      cantidad: 2,
      cliente: 'Ana Pérez',
      estado: 'pendiente',
      respuesta: null,
    });
    expect(response.fecha).not.toBe('');
  });

  it('carga consultas reales por almacén', async () => {
    httpClient.get.mockResolvedValueOnce({
      data: [{
        idConsulta: 5,
        idEstadoConsulta: 1,
        detalles: [{ descripcion: '¿Tiene arroz?', cantidadSolicitada: 2 }],
      }],
    });

    const response = await fetchConsultasAlmacenero(7);

    expect(httpClient.get).toHaveBeenCalledWith('/api/consultas/almacen/7');
    expect(response).toHaveLength(1);
    expect(response[0]).toMatchObject({ id: '5', estado: 'pendiente' });
  });

  it('carga dashboard y mapea consultas recientes', async () => {
    httpClient.get.mockResolvedValueOnce({
      data: {
        totalConsultas: 2,
        pendientes: 1,
        consultasRecientes: [{
          idConsulta: 8,
          idEstadoConsulta: 2,
          detalles: [{ descripcion: 'Pan', cantidadSolicitada: 1 }],
        }],
      },
    });

    const response = await fetchDashboardAlmacenero(7);

    expect(httpClient.get).toHaveBeenCalledWith('/api/consultas/almacen/7/dashboard');
    expect(response.totalConsultas).toBe(2);
    expect(response.consultasRecientes[0]).toMatchObject({ id: '8', estado: 'respondida' });
  });

  it('responde consulta sin enviar idEstadoConsulta cuando se usa el default backend', async () => {
    httpClient.put.mockResolvedValueOnce({ data: { idConsulta: 5, respuesta: 'Sí' } });

    await responderConsulta(5, 'Sí');

    expect(httpClient.put).toHaveBeenCalledWith('/api/consultas/5/responder', { respuesta: 'Sí' });
  });

  it('cierra consulta buscando el estado CERRADA', async () => {
    httpClient.get.mockResolvedValueOnce({
      data: [{ idEstadoConsulta: 3, nombre: 'CERRADA' }],
    });
    httpClient.put.mockResolvedValueOnce({ data: { idConsulta: 5, idEstadoConsulta: 3 } });

    await cerrarConsulta(5);

    expect(httpClient.get).toHaveBeenCalledWith('/api/estados-consulta');
    expect(httpClient.put).toHaveBeenCalledWith('/api/consultas/5/estado', null, {
      params: { idEstadoConsulta: 3 },
    });
  });
});
