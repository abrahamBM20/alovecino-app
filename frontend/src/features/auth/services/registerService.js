import { httpClient } from '../../../shared/api/httpClient';
import { API_BASE_URL } from '../../../config/environment';

function isMockEnvironment() {
  return API_BASE_URL.includes('example.com');
}

function toIsoDate(date) {
  const [day, month, year] = date.split('/');
  return `${year}-${month}-${day}`;
}

export function buildRegisterPayload({
  tipoUsuario,
  rut,
  nombreUsuario,
  nombreCompleto,
  fechaNacimiento,
  nombreAlmacen,
  telefono,
  calle,
  numero,
  comuna,
  region,
  codigoPostal,
  email,
  password,
}) {
  const tipoCuenta = tipoUsuario === 'almacen' ? 'ALMACEN' : 'CLIENTE';
  const payload = {
    rut,
    nombreUsuario,
    nombre: nombreCompleto,
    correo: email,
    contrasena: password,
    tipoCuenta,
    direccion: {
      calle,
      numero,
      comuna,
      region,
      codigoPostal: codigoPostal || null,
    },
  };

  if (tipoCuenta === 'CLIENTE') {
    payload.fechaNacimiento = toIsoDate(fechaNacimiento);
  }

  if (tipoCuenta === 'ALMACEN') {
    payload.nombreAlmacen = nombreAlmacen;
    payload.telefono = telefono;
  }

  return payload;
}

export async function registerService(formData) {
  if (isMockEnvironment()) {
    return { success: true };
  }

  await httpClient.post('/api/usuarios', buildRegisterPayload(formData));

  return { success: true };
}
