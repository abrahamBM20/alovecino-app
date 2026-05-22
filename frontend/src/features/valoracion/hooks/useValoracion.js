import { useState, useEffect, useCallback } from 'react';
import {
  getValoracionesByAlmacen,
  createValoracion,
  updateValoracion,
  deleteValoracion,
  getMisValoraciones,
} from '../services/valoracionService';
import { mapApiError } from '../../../shared/api/errorMapper';

export function useValoracion(idAlmacen) {
  const [valoraciones, setValoraciones] = useState([]);
  const [miValoracion, setMiValoracion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [estrellas, setEstrellas] = useState(0);
  const [contenido, setContenido] = useState('');

  const load = useCallback(async () => {
    if (!idAlmacen) return;
    setIsLoading(true);
    setError(null);
    try {
      const [todas, mias] = await Promise.all([
        getValoracionesByAlmacen(idAlmacen),
        getMisValoraciones(),
      ]);
      setValoraciones(todas);
      const propia = mias.find((v) => v.idAlmacen === Number(idAlmacen));
      setMiValoracion(propia ?? null);
    } catch (e) {
      setError(mapApiError(e));
    } finally {
      setIsLoading(false);
    }
  }, [idAlmacen]);

  useEffect(() => {
    load();
  }, [load]);

  async function guardar() {
    if (estrellas === 0) {
      setError('Debes seleccionar al menos 1 estrella.');
      return;
    }
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);
    try {
      const nueva = await createValoracion({
        cantidadEstrellas: estrellas,
        contenido: contenido.trim() || null,
        idAlmacen: Number(idAlmacen),
      });
      setValoraciones((prev) => [nueva, ...prev]);
      setMiValoracion(nueva);
      setEstrellas(0);
      setContenido('');
      setSaveSuccess(true);
      return true;
    } catch (e) {
      setError(mapApiError(e));
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function actualizar() {
    if (!miValoracion) return;
    if (estrellas === 0) {
      setError('Debes seleccionar al menos 1 estrella.');
      return;
    }
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);
    try {
      const actualizada = await updateValoracion(miValoracion.idValoracion, {
        cantidadEstrellas: estrellas,
        contenido: contenido.trim() || null,
      });
      setValoraciones((prev) =>
        prev.map((v) => (v.idValoracion === actualizada.idValoracion ? actualizada : v))
      );
      setMiValoracion(actualizada);
      setSaveSuccess(true);
      return true;
    } catch (e) {
      setError(mapApiError(e));
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function eliminar() {
    if (!miValoracion) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteValoracion(miValoracion.idValoracion);
      setValoraciones((prev) => prev.filter((v) => v.idValoracion !== miValoracion.idValoracion));
      setMiValoracion(null);
      setSaveSuccess(false);
    } catch (e) {
      setError(mapApiError(e));
    } finally {
      setIsDeleting(false);
    }
  }

  const promedio =
    valoraciones.length > 0
      ? (valoraciones.reduce((sum, v) => sum + v.cantidadEstrellas, 0) / valoraciones.length).toFixed(1)
      : null;

  return {
    valoraciones,
    miValoracion,
    isLoading,
    isSaving,
    isDeleting,
    error,
    saveSuccess,
    estrellas,
    setEstrellas,
    contenido,
    setContenido,
    guardar,
    actualizar,
    eliminar,
    promedio,
  };
}
