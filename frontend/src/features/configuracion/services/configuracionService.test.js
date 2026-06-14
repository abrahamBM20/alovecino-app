describe('configuracionService', () => {
  function loadService({ apiBaseUrl = 'http://localhost:8080', token = 'token-qa', httpClientOverrides = {} } = {}) {
    jest.resetModules();
    jest.doMock('../../../config/environment', () => ({
      API_BASE_URL: apiBaseUrl,
    }));
    jest.doMock('../../../store/authStore', () => ({
      useAuthStore: {
        getState: () => ({ accessToken: token }),
      },
    }));
    jest.doMock('../../../shared/api/httpClient', () => ({
      httpClient: {
        get: jest.fn(),
        put: jest.fn(),
        ...httpClientOverrides,
      },
    }));

    let service;
    let httpClient;
    jest.isolateModules(() => {
      service = require('./configuracionService');
      ({ httpClient } = require('../../../shared/api/httpClient'));
    });

    return { service, httpClient };
  }

  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('usa configuración mock y persiste cambios localmente en entorno example', async () => {
    const { service, httpClient } = loadService({
      apiBaseUrl: 'https://api-dev.example.com',
    });

    await expect(service.getConfiguracion('42')).resolves.toMatchObject({
      notificacionesPush: true,
      radioOfertasKm: 1.0,
    });

    await expect(service.updateConfiguracion('42', {
      notificacionesPush: false,
      notificacionesEmail: true,
      recibirOfertas: true,
      perfilVisible: false,
      radioOfertasKm: 2.5,
    })).resolves.toMatchObject({
      notificacionesPush: false,
      perfilVisible: false,
      radioOfertasKm: 2.5,
    });

    await expect(service.getConfiguracion('42')).resolves.toMatchObject({
      notificacionesPush: false,
      perfilVisible: false,
      radioOfertasKm: 2.5,
    });
    expect(httpClient.get).not.toHaveBeenCalled();
    expect(httpClient.put).not.toHaveBeenCalled();
  });

  it('obtiene configuración real con token bearer del store', async () => {
    const getMock = jest.fn().mockResolvedValue({
      data: {
        idUsuario: 42,
        notificacionesPush: true,
        notificacionesEmail: false,
        recibirOfertas: true,
        perfilVisible: true,
        radioOfertasKm: 3.0,
      },
    });
    const { service } = loadService({
      token: 'jwt-config',
      httpClientOverrides: { get: getMock },
    });

    await expect(service.getConfiguracion(42)).resolves.toMatchObject({
      idUsuario: 42,
      radioOfertasKm: 3.0,
    });
    expect(getMock).toHaveBeenCalledWith('/api/configuracion/42', {
      headers: { Authorization: 'Bearer jwt-config' },
    });
  });

  it('actualiza configuración real con payload y token bearer', async () => {
    const payload = {
      notificacionesPush: false,
      notificacionesEmail: true,
      recibirOfertas: false,
      perfilVisible: true,
      radioOfertasKm: 5,
    };
    const putMock = jest.fn().mockResolvedValue({ data: { idUsuario: 42, ...payload } });
    const { service } = loadService({
      token: 'jwt-config',
      httpClientOverrides: { put: putMock },
    });

    await expect(service.updateConfiguracion(42, payload)).resolves.toEqual({
      idUsuario: 42,
      ...payload,
    });
    expect(putMock).toHaveBeenCalledWith('/api/configuracion/42', payload, {
      headers: { Authorization: 'Bearer jwt-config' },
    });
  });
});
