import { httpClient } from '../../../shared/api/httpClient';
import { API_BASE_URL } from '../../../config/environment';

function isMockEnvironment() {
  return API_BASE_URL.includes('example.com');
}

export async function registerService({
  nombreCompleto,
  fechaNacimiento,
  nombreUsuario,
  email,
  password,
}) {
  if (isMockEnvironment()) {
    return { success: true };
  }

  await httpClient.post('/api/usuarios', {
    nombreCompleto,
    fechaNacimiento,
    nombreUsuario,
    email,
    contrasena: password,
    nombreRol: 'CLIENTE',
  });

  return { success: true };
}
