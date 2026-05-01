import { z } from 'zod';

export const registerSchema = z
  .object({
    nombreCompleto: z.string().min(2, 'Ingresa tu nombre completo'),
    fechaNacimiento: z
      .string()
      .min(1, 'Ingresa tu fecha de nacimiento')
      .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Formato: DD/MM/AAAA'),
    nombreUsuario: z
      .string()
      .min(3, 'El usuario debe tener al menos 3 caracteres')
      .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, numeros y guion bajo'),
    email: z.string().email('Correo electronico invalido'),
    password: z.string().min(8, 'La contrasena debe tener al menos 8 caracteres'),
    confirmarPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmarPassword, {
    message: 'Las contrasenas no coinciden',
    path: ['confirmarPassword'],
  });
