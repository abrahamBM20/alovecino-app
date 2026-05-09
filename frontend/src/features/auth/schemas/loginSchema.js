import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Ingresa tu correo electrónico.' })
    .email('Ingresa un correo válido.'),
  password: z
    .string({ required_error: 'Ingresa tu contraseña.' })
    .min(6, 'La contraseña debe tener al menos 6 caracteres.'),
});
