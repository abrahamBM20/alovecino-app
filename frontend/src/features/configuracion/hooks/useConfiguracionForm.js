import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { getConfiguracion, updateConfiguracion } from '../services/configuracionService';
import { mapApiError } from '../../../shared/api/errorMapper';

export function useConfiguracionForm() {
  const user = useAuthStore((state) => state.user);

  const [config, setConfig] = useState({
    notificacionesPush: true,
    notificacionesEmail: true,
    recibirOfertas: false,
    perfilVisible: true,
    radioOfertasKm: 1.0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    load();
  }, [user?.id]);

  async function load() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getConfiguracion(user.id);
      setConfig({
        notificacionesPush: data.notificacionesPush ?? true,
        notificacionesEmail: data.notificacionesEmail ?? true,
        recibirOfertas: data.recibirOfertas ?? false,
        perfilVisible: data.perfilVisible ?? true,
        radioOfertasKm: data.radioOfertasKm ?? 1.0,
      });
    } catch (e) {
      setError(mapApiError(e));
    } finally {
      setIsLoading(false);
    }
  }

  function updateField(key, value) {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setSaveSuccess(false);
  }

  async function save() {
    if (!user?.id) return;
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);
    try {
      await updateConfiguracion(user.id, config);
      setSaveSuccess(true);
    } catch (e) {
      setError(mapApiError(e));
    } finally {
      setIsSaving(false);
    }
  }

  return { config, isLoading, isSaving, error, saveSuccess, updateField, save };
}
