import { z } from 'zod';

const LATAM_PERSON_NAME_REGEX = /^[\p{L}\p{M}][\p{L}\p{M} .'’-]*$/u;

export const registerSchema = z
  .object({
    tipoUsuario: z.enum(['cliente', 'almacen'], {
      message: 'Selecciona si eres cliente o almacén',
    }),
    nombreCompleto: z
      .string()
      .trim()
      .min(2, 'Ingresa tu nombre completo')
      .regex(LATAM_PERSON_NAME_REGEX, 'Ingresa un nombre válido'),
    fechaNacimiento: z
      .string()
      .min(1, 'Ingresa tu fecha de nacimiento')
      .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Formato: DD/MM/AAAA'),
    email: z.string().email('Correo electrónico inválido'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    confirmarPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmarPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmarPassword'],
  });
