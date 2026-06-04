import { httpClient } from '../../../shared/api/httpClient';
import { API_BASE_URL } from '../../../config/environment';

function isMockEnvironment() {
  return API_BASE_URL.includes('example.com');
}

const MOCK_CLIENTE_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZXMiOlsiUk9MRV9DTElFTlRFIl0sIm5hbWUiOiJUZXN0IENsaWVudGUifQ.mock-signature';

export async function loginService({ email, password }) {
  if (isMockEnvironment()) {
    return {
      accessToken: MOCK_CLIENTE_TOKEN,
      user: { id: '1', name: 'Demo Cliente', email },
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
