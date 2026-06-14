import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.02'],
    http_req_duration: ['p(95)<1500'],
  },
  scenarios: {
    vecinos_consultando: {
      executor: 'ramping-vus',
      stages: [
        { duration: '30s', target: 10 },
        { duration: '1m', target: 25 },
        { duration: '30s', target: 0 },
      ],
    },
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const QA_MAP_LATITUDE = __ENV.QA_MAP_LATITUDE || '-33.44889';
const QA_MAP_LONGITUDE = __ENV.QA_MAP_LONGITUDE || '-70.669265';

export default function () {
  http.setResponseCallback(http.expectedStatuses({ min: 200, max: 399 }, 401, 403));

  const responses = http.batch([
    ['GET', `${BASE_URL}/actuator/health`],
    ['GET', `${BASE_URL}/v3/api-docs`],
    ['GET', `${BASE_URL}/api/usuarios`],
    ['GET', `${BASE_URL}/api/geo/stores?latitud=${QA_MAP_LATITUDE}&longitud=${QA_MAP_LONGITUDE}&radio_metros=10000`],
  ]);

  check(responses[0], {
    'gateway health responds': (response) => response.status === 200,
  });
  check(responses[1], {
    'openapi is reachable': (response) => response.status === 200,
  });
  check(responses[2], {
    'usuarios contract is stable': (response) => [200, 401, 403].includes(response.status),
  });
  check(responses[3], {
    'geo stores extended radius contract is stable': (response) => [200, 401, 403].includes(response.status),
  });

  sleep(1);
}
