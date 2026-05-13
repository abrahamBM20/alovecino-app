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
      },
    };
  }

  const { data } = await httpClient.post('/auth/login', {
    email,
    password,
  });

  return {
    accessToken: data?.accessToken,
    user: data?.user,
  };
}

export async function logoutService() {
  if (isMockEnvironment()) {
    return;
  }

  await httpClient.post('/auth/logout');
}
