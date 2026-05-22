import { z } from 'zod';

const LATAM_TEXT_REGEX = /^[\p{L}\p{M}0-9 .,'’#°ºª/-]+$/u;
const LATAM_PHONE_REGEX = /^[0-9+() -]+$/;

export const almacenSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, 'Ingresa el nombre del almacén')
    .regex(LATAM_TEXT_REGEX, 'Ingresa un nombre de almacén válido'),
  calle: z
    .string()
    .trim()
    .min(2, 'Ingresa la calle')
    .regex(LATAM_TEXT_REGEX, 'Ingresa una calle válida'),
  numero: z
    .string()
    .trim()
    .min(1, 'Ingresa el número')
    .regex(LATAM_TEXT_REGEX, 'Ingresa un número válido'),
  comuna: z
    .string()
    .trim()
    .min(2, 'Ingresa la comuna')
    .regex(LATAM_TEXT_REGEX, 'Ingresa una comuna válida'),
  region: z
    .string()
    .trim()
    .min(2, 'Ingresa la región')
    .regex(LATAM_TEXT_REGEX, 'Ingresa una región válida'),
  codigoPostal: z
    .string()
    .trim()
    .max(20, 'El código postal no puede superar 20 caracteres')
    .optional(),
  telefono: z
    .string()
    .trim()
    .min(8, 'Ingresa un teléfono válido')
    .regex(LATAM_PHONE_REGEX, 'Ingresa un teléfono válido'),
});
