import { z } from 'zod';

const LATAM_PERSON_NAME_REGEX = /^[\p{L}\p{M}][\p{L}\p{M} .'’-]*$/u;
const LATAM_TEXT_REGEX = /^[\p{L}\p{M}0-9 .,'’#°ºª/-]+$/u;
const USERNAME_REGEX = /^[\p{L}\p{M}0-9._-]+$/u;
const RUT_REGEX = /^\d{1,8}[\dkK]$/;

function normalizeRut(rut) {
  const cleaned = rut.replace(/\./g, '').replace(/\s/g, '').toUpperCase();
  const normalized = cleaned.replace(/-/g, '');
  const body = normalized.slice(0, -1);
  const dv = normalized.slice(-1);
  return { body, dv };
}

function isValidRut(rut) {
  const { body, dv } = normalizeRut(rut);
  if (!RUT_REGEX.test(`${body}${dv}`)) return false;

  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i -= 1) {
    sum += Number(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = 11 - (sum % 11);
  const expected = remainder === 11 ? '0' : remainder === 10 ? 'K' : String(remainder);
  return expected === dv;
}

function isValidBirthDate(value) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return false;

  const [, day, month, year] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const today = new Date();

  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day
    && date < today;
}

export const registerSchema = z
  .object({
    tipoUsuario: z.enum(['cliente', 'almacen'], {
      message: 'Selecciona si eres cliente o almacén',
    }),
    rut: z
      .string()
      .trim()
      .min(1, 'Ingresa tu RUT')
      .max(12, 'El RUT no puede superar 12 caracteres')
      .refine(isValidRut, 'Ingresa un RUT válido'),
    nombreUsuario: z
      .string()
      .trim()
      .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
      .max(120, 'El nombre de usuario no puede superar 120 caracteres')
      .regex(USERNAME_REGEX, 'Usa solo letras, números, punto, guion o guion bajo'),
    nombreCompleto: z
      .string()
      .trim()
      .min(2, 'Ingresa tu nombre completo')
      .max(160, 'El nombre no puede superar 160 caracteres')
      .regex(LATAM_PERSON_NAME_REGEX, 'Ingresa un nombre válido'),
    fechaNacimiento: z
      .string()
      .trim(),
    nombreAlmacen: z
      .string()
      .trim()
      .max(140, 'El nombre del almacén no puede superar 140 caracteres')
      .refine((value) => !value || LATAM_TEXT_REGEX.test(value), 'Ingresa un nombre de almacén válido')
      .optional(),
    calle: z
      .string()
      .trim()
      .min(1, 'Ingresa la calle')
      .max(160, 'La calle no puede superar 160 caracteres')
      .regex(LATAM_TEXT_REGEX, 'Ingresa una calle válida'),
    numero: z
      .string()
      .trim()
      .min(1, 'Ingresa el número')
      .max(30, 'El número no puede superar 30 caracteres')
      .regex(LATAM_TEXT_REGEX, 'Ingresa un número válido'),
    comuna: z
      .string()
      .trim()
      .min(1, 'Ingresa la comuna')
      .max(120, 'La comuna no puede superar 120 caracteres')
      .regex(LATAM_TEXT_REGEX, 'Ingresa una comuna válida'),
    region: z
      .string()
      .trim()
      .min(1, 'Ingresa la región')
      .max(120, 'La región no puede superar 120 caracteres')
      .regex(LATAM_TEXT_REGEX, 'Ingresa una región válida'),
    codigoPostal: z
      .string()
      .trim()
      .max(20, 'El código postal no puede superar 20 caracteres')
      .optional(),
    email: z.string().trim().email('Correo electrónico inválido').max(180, 'El correo no puede superar 180 caracteres'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').max(100, 'La contraseña no puede superar 100 caracteres'),
    confirmarPassword: z.string(),
  })
  .refine((data) => data.tipoUsuario !== 'cliente' || isValidBirthDate(data.fechaNacimiento), {
    message: 'Ingresa una fecha de nacimiento válida',
    path: ['fechaNacimiento'],
  })
  .refine((data) => data.tipoUsuario !== 'almacen' || !!data.nombreAlmacen?.trim(), {
    message: 'Ingresa el nombre del almacén',
    path: ['nombreAlmacen'],
  })
  .refine((data) => data.password === data.confirmarPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmarPassword'],
  });
