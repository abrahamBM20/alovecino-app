import { httpClient } from '../../../shared/api/httpClient';
import { API_BASE_URL } from '../../../config/environment';

function isMockEnvironment() {
  return API_BASE_URL.includes('example.com');
}

export async function loginService({ email, password }) {
  if (isMockEnvironment()) {
    return {
      accessToken: 'dev-token',
      user: {
        id: '1',
        name: 'Usuario Demo',
        email,
        rol: 'ALMACEN', // Por defecto ALMACEN para testing
      },
    };
  }

  const { data } = await httpClient.post('/auth/login', {
    email,
    password,
  });

  return {
    accessToken: data?.accessToken,
    user: {
      id: data?.user?.id,
      name: data?.user?.name,
      email: data?.user?.email,
      rol: data?.user?.rol,
    },
  };
}

export async function logoutService() {
  if (isMockEnvironment()) {
    return;
  }

  await httpClient.post('/auth/logout');
}
