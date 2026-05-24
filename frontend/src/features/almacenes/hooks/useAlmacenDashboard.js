import { useEffect, useState } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { isDevelopment } from '../../../config/environment';
import {
  getMisAlmacenes,
  getConsultasRecientes,
  getEstadisticasAlmacen,
  cambiarEstadoAlmacen,
} from '../services/almacenService';

export function useAlmacenDashboard() {
  const [almacenes, setAlmacenes] = useState([]);
  const [almacenActual, setAlmacenActual] = useState(null);
  const [consultasRecientes, setConsultasRecientes] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const usuario = useAuthStore((state) => state.user);

  useEffect(() => {
    cargarDatos();
  }, [usuario]);

  const cargarDatos = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (isDevelopment()) {
        const mockAlmacenes = [
          {
            idAlmacen: 1,
            nombre: 'Almacén La Esquina',
            estado: 'ABIERTO',
          },
        ];
        setAlmacenes(mockAlmacenes);
        setAlmacenActual(mockAlmacenes[0]);

        setConsultasRecientes([
          {
            idConsulta: 1001,
            descripcion: 'Necesito saber si tienen azúcar',
            createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
            nombre: 'PENDIENTE',
          },
          {
            idConsulta: 1002,
            descripcion: '¿Se puede reservar 2 kilos de arroz?',
            createdAt: new Date(Date.now() - 35 * 60000).toISOString(),
            nombre: 'RESPONDIDA',
          },
          {
            idConsulta: 1003,
            descripcion: 'Consulta por horario de atención',
            createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
            nombre: 'PENDIENTE',
          },
          {
            idConsulta: 1004,
            descripcion: '¿Tienen leche deslactosada?',
            createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
            nombre: 'RESPONDIDA',
          },
        ]);

        setEstadisticas({
          consultasHoy: 18,
          consultasPendientes: 4,
          consultasRespondidas: 14,
          tiempoPromedioRespuestaMinutos: 12.5,
          clientesAtendidosUnicoHoy: 11,
        });

        return;
      }

      // Obtener mis almacenes
      const almacenesData = await getMisAlmacenes();
      setAlmacenes(almacenesData);

      if (almacenesData.length > 0) {
        const almacen = almacenesData[0];
        setAlmacenActual(almacen);
        await cargarDatosAlmacen(almacen.idAlmacen);
      }
    } catch (err) {
      setError(
        err.message || 'Error al cargar los datos del almacén'
      );
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const cargarDatosAlmacen = async (idAlmacen) => {
    try {
      if (isDevelopment()) {
        setConsultasRecientes([
          {
            idConsulta: 1001,
            descripcion: 'Necesito saber si tienen azúcar',
            createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
            nombre: 'PENDIENTE',
          },
          {
            idConsulta: 1002,
            descripcion: '¿Se puede reservar 2 kilos de arroz?',
            createdAt: new Date(Date.now() - 35 * 60000).toISOString(),
            nombre: 'RESPONDIDA',
          },
          {
            idConsulta: 1003,
            descripcion: 'Consulta por horario de atención',
            createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
            nombre: 'PENDIENTE',
          },
          {
            idConsulta: 1004,
            descripcion: '¿Tienen leche deslactosada?',
            createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
            nombre: 'RESPONDIDA',
          },
        ]);

        setEstadisticas({
          consultasHoy: 18,
          consultasPendientes: 4,
          consultasRespondidas: 14,
          tiempoPromedioRespuestaMinutos: 12.5,
          clientesAtendidosUnicoHoy: 11,
        });
        return;
      }

      const [consultas, stats] = await Promise.all([
        getConsultasRecientes(idAlmacen),
        getEstadisticasAlmacen(idAlmacen),
      ]);

      setConsultasRecientes(consultas);
      setEstadisticas(stats);
    } catch (err) {
      console.error('Error cargando datos del almacén:', err);
    }
  };

  const cambiarAlmacen = async (almacen) => {
    setAlmacenActual(almacen);
    await cargarDatosAlmacen(almacen.idAlmacen);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (almacenActual) {
        await cargarDatosAlmacen(almacenActual.idAlmacen);
      }
    } finally {
      setRefreshing(false);
    }
  };

  const cambiarEstado = async (nuevoEstado) => {
    try {
      if (almacenActual) {
        if (isDevelopment()) {
          setAlmacenActual({
            ...almacenActual,
            estado: nuevoEstado,
          });
          return;
        }

        const updatedAlmacen = await cambiarEstadoAlmacen(
          almacenActual.idAlmacen,
          nuevoEstado
        );
        setAlmacenActual(updatedAlmacen);
      }
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      throw err;
    }
  };

  return {
    almacenes,
    almacenActual,
    consultasRecientes,
    estadisticas,
    isLoading,
    error,
    refreshing,
    cargarDatos,
    cambiarAlmacen,
    onRefresh,
    cambiarEstado,
  };
}
