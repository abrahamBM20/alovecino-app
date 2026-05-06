import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '../schemas/registerSchema';
import { registerService } from '../services/registerService';

export function useRegisterForm(navigation) {
  const [isLoading, setIsLoading] = useState(false);
  const [registerError, setRegisterError] = useState(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    defaultValues: {
      tipoUsuario: 'cliente',
      nombreCompleto: '',
      fechaNacimiento: '',
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
      navigation.navigate('Login');
    } catch {
      setRegisterError('No se pudo crear la cuenta. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  });

  return {
    control,
    errors,
    isLoading,
    registerError,
    onSubmit,
    canSubmit: isValid && !isLoading,
  };
}
