describe('httpClient', () => {
  let requestHandler;
  let responseSuccessHandler;
  let responseErrorHandler;
  let axiosInstance;
  let mockAuthState;

  function loadHttpClient() {
    jest.resetModules();

    requestHandler = null;
    responseSuccessHandler = null;
    responseErrorHandler = null;
    axiosInstance = jest.fn((config) => Promise.resolve({ config, data: { ok: true } }));
    axiosInstance.interceptors = {
      request: {
        use: jest.fn((handler) => {
          requestHandler = handler;
        }),
      },
      response: {
        use: jest.fn((success, error) => {
          responseSuccessHandler = success;
          responseErrorHandler = error;
        }),
      },
    };

    jest.doMock('axios', () => ({
      create: jest.fn(() => axiosInstance),
    }));
    jest.doMock('../../config/environment', () => ({
      API_BASE_URL: 'http://localhost:8080',
      API_TIMEOUT_MS: 1000,
    }));
    jest.doMock('../../store/authStore', () => ({
      useAuthStore: {
        getState: () => mockAuthState,
      },
    }));

    return require('./httpClient').httpClient;
  }

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthState = {
      accessToken: 'access-old',
      refreshSession: jest.fn().mockResolvedValue('access-new'),
      clearSession: jest.fn(),
    };
  });

  afterEach(() => {
    jest.resetModules();
  });

  it('agrega Authorization cuando existe accessToken', () => {
    loadHttpClient();

    const config = requestHandler({ headers: {} });

    expect(config.headers.Authorization).toBe('Bearer access-old');
  });

  it('renueva sesion y reintenta la request original ante 401', async () => {
    loadHttpClient();

    const originalConfig = {
      url: '/api/geo/stores',
      headers: {},
    };
    const result = await responseErrorHandler({
      config: originalConfig,
      response: {
        status: 401,
        data: { message: 'Token requerido o invalido' },
      },
    });

    expect(mockAuthState.refreshSession).toHaveBeenCalledTimes(1);
    expect(axiosInstance).toHaveBeenCalledWith(expect.objectContaining({
      url: '/api/geo/stores',
      _retry: true,
      headers: expect.objectContaining({
        Authorization: 'Bearer access-new',
      }),
    }));
    expect(result.data).toEqual({ ok: true });
  });

  it('no intenta refresh contra endpoints de autenticacion', async () => {
    loadHttpClient();

    await expect(responseErrorHandler({
      config: { url: '/auth/refresh' },
      response: {
        status: 401,
        data: { message: 'Refresh token inválido' },
      },
    })).rejects.toMatchObject({
      message: 'Refresh token inválido',
    });

    expect(mockAuthState.refreshSession).not.toHaveBeenCalled();
  });
});
