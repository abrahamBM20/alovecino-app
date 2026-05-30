import { httpClient } from '../../../shared/api/httpClient';
import { API_BASE_URL } from '../../../config/environment';

function isMockEnvironment() {
  return API_BASE_URL.includes('example.com');
}

const MOCK_ALMACEN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZXMiOlsiUk9MRV9BTE1BQ0VOIl0sIm5hbWUiOiJUZXN0IEFsbWFjZW4ifQ.mock-signature';

export async function loginService({ email, password }) {
  if (isMockEnvironment()) {
    return {
      accessToken: MOCK_ALMACEN_TOKEN,
      user: { id: '1', name: 'Test Almacen', email },
    };
  }

  const { data } = await httpClient.post('/auth/login', { email, password });

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
