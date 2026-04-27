import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Ingresa tu correo electronico.' })
    .email('Ingresa un correo valido.'),
  password: z
    .string({ required_error: 'Ingresa tu contrasena.' })
    .min(6, 'La contrasena debe tener al menos 6 caracteres.'),
});
