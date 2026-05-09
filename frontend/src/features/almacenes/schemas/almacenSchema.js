import { z } from 'zod';

const LATAM_TEXT_REGEX = /^[\p{L}\p{M}0-9 .,'’#°ºª/-]+$/u;
const LATAM_PHONE_REGEX = /^[0-9+() -]+$/;

export const almacenSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, 'Ingresa el nombre del almacén')
    .regex(LATAM_TEXT_REGEX, 'Ingresa un nombre de almacén válido'),
  direccion: z
    .string()
    .trim()
    .min(4, 'Ingresa la dirección')
    .regex(LATAM_TEXT_REGEX, 'Ingresa una dirección válida'),
  comuna: z
    .string()
    .trim()
    .min(2, 'Ingresa la comuna')
    .regex(LATAM_TEXT_REGEX, 'Ingresa una comuna válida'),
  telefono: z
    .string()
    .trim()
    .min(8, 'Ingresa un teléfono válido')
    .regex(LATAM_PHONE_REGEX, 'Ingresa un teléfono válido'),
});
