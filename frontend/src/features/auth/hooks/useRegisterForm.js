import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { registerSchema } from '../schemas/registerSchema';
import { registerService } from '../services/registerService';

export function useRegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [registerError, setRegisterError] = useState(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      tipoUsuario: 'cliente',
      rut: '',
      nombreUsuario: '',
      nombreCompleto: '',
      fechaNacimiento: '',
      nombreAlmacen: '',
      calle: '',
      numero: '',
      comuna: '',
      region: '',
      codigoPostal: '',
      email: '',
      password: '',
      confirmarPassword: '',
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    setIsLoading(true);
    setRegisterError(null);
    try {
      await registerService(data);
      router.replace('/auth/login');
    } catch (error) {
      setRegisterError(error?.message || 'No se pudo crear la cuenta. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  });

  return {
    control,
    errors,
    tipoUsuario: watch('tipoUsuario'),
    isLoading,
    registerError,
    onSubmit,
    canSubmit: isValid && !isLoading,
  };
}
