import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../schemas/loginSchema';
import { useAuthStore } from '../../../store/authStore';

export function useLoginForm() {
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const authError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    clearError();
    await login(values);
  });

  return useMemo(
    () => ({
      control,
      errors,
      isLoading,
      authError,
      onSubmit,
      canSubmit: isValid && !isLoading,
    }),
    [authError, control, errors, isLoading, isValid, onSubmit],
  );
}
