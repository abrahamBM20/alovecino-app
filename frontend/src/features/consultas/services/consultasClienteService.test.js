import { httpClient } from '../../../shared/api/httpClient';
import {
  crearConsultaCliente,
  fetchConsultasCliente,
  mapConsultaCliente,
} from './consultasClienteService';

jest.mock('../../../shared/api/httpClient', () => ({
  httpClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe('consultasClienteService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('mapea consulta normalizada con detalles al modelo de UI cliente', () => {
    const consulta = mapConsultaCliente({
      idConsulta: 21,
      idCliente: 9,
      idAlmacen: 7,
      nombreAlmacen: 'Almacén Los Queltehues',
      idEstadoConsulta: 2,
      estadoNombre: 'RESPONDIDA',
      respuesta: 'Sí, tenemos stock',
      createdAt: '2026-06-05T12:30:00',
      fechaRespuesta: '2026-06-05T12:40:00',
      detalles: [
        {
          idConsultaDetalle: 31,
          descripcion: 'Arroz grado 1',
          cantidadSolicitada: 2,
        },
      ],
    });

    expect(consulta).toMatchObject({
      id: '21',
      estado: 'respondida',
      nombreAlmacen: 'Almacén Los Queltehues',
      resumen: 'Arroz grado 1 (2)',
      respuesta: 'Sí, tenemos stock',
      detalles: [
        {
          id: '31',
          descripcion: 'Arroz grado 1',
          cantidadSolicitada: 2,
        },
      ],
    });
    expect(consulta.fecha).not.toBe('');
    expect(consulta.fechaRespuesta).not.toBe('');
  });

  it('crea consulta enviando detalles con cantidadSolicitada', async () => {
    httpClient.post.mockResolvedValueOnce({
      data: {
        idConsulta: 21,
        idCliente: 9,
        idAlmacen: 7,
        idEstadoConsulta: 1,
        estadoNombre: 'PENDIENTE',
        detalles: [{ idConsultaDetalle: 31, descripcion: 'Pan amasado', cantidadSolicitada: 4 }],
      },
    });

    const response = await crearConsultaCliente({
      idCliente: '9',
      idAlmacen: '7',
      detalles: [{ descripcion: '  Pan amasado  ', cantidadSolicitada: '4' }],
    });

    expect(httpClient.post).toHaveBeenCalledWith('/api/consultas', {
      idCliente: 9,
      idAlmacen: 7,
      detalles: [{ descripcion: 'Pan amasado', cantidadSolicitada: 4 }],
    });
    expect(response).toMatchObject({
      id: '21',
      estado: 'pendiente',
      resumen: 'Pan amasado (4)',
    });
  });

  it('carga consultas del cliente desde el backend', async () => {
    httpClient.get.mockResolvedValueOnce({
      data: [
        {
          idConsulta: 22,
          idEstadoConsulta: 1,
          detalles: [{ idConsultaDetalle: 32, descripcion: 'Leche', cantidadSolicitada: 1 }],
        },
      ],
    });

    const response = await fetchConsultasCliente(9);

    expect(httpClient.get).toHaveBeenCalledWith('/api/consultas/cliente/9');
    expect(response).toHaveLength(1);
    expect(response[0]).toMatchObject({ id: '22', resumen: 'Leche (1)' });
  });
});
