import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { almacenSchema } from '../schemas/almacenSchema';
import { createAlmacenService } from '../services/almacenService';

export function useAlmacenForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [createdAlmacen, setCreatedAlmacen] = useState(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(almacenSchema),
    mode: 'onBlur',
    defaultValues: {
      nombre: '',
      direccion: '',
      comuna: '',
      telefono: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setIsLoading(true);
    setSubmitError(null);
    setCreatedAlmacen(null);

    try {
      const response = await createAlmacenService(values);
      setCreatedAlmacen(response);
    } catch {
      setSubmitError('No se pudo registrar el almacen. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  });

  return {
    control,
    errors,
    isLoading,
    submitError,
    createdAlmacen,
    onSubmit,
    canSubmit: isValid && !isLoading,
    goBack: () => router.back(),
  };
}
