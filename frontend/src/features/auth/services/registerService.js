import { httpClient } from '../../../shared/api/httpClient';
import { API_BASE_URL } from '../../../config/environment';

function isMockEnvironment() {
  return API_BASE_URL.includes('example.com');
}

export async function registerService({
  tipoUsuario,
  nombreCompleto,
  fechaNacimiento,
  email,
  password,
}) {
  if (isMockEnvironment()) {
    return { success: true };
  }

  await httpClient.post('/api/usuarios', {
    nombreCompleto,
    fechaNacimiento,
    nombreUsuario: email,
    email,
    contrasena: password,
    nombreRol: tipoUsuario === 'almacen' ? 'STORE_OWNER' : 'USER',
  });

  return { success: true };
}
