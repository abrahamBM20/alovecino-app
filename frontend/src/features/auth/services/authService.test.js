describe('loginService', () => {
  function loadLoginService() {
    let loginService;

    jest.isolateModules(() => {
      ({ loginService } = require('./authService'));
    });

    return loginService;
  }

  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('retorna respuesta mock en entorno de ejemplo', async () => {
    jest.doMock('../../../config/environment', () => ({
      API_BASE_URL: 'https://api-dev.example.com',
    }));

    const postMock = jest.fn();
    jest.doMock('../../../shared/api/httpClient', () => ({
      httpClient: {
        post: postMock,
      },
    }));

    const loginService = loadLoginService();
    const response = await loginService({
      email: 'demo@alovecino.com',
      password: '123456',
    });

    expect(response.accessToken).toBe('dev-token');
    expect(response.user.email).toBe('demo@alovecino.com');
    expect(postMock).not.toHaveBeenCalled();
  });

  it('mapea el contrato del backend para login real', async () => {
    jest.doMock('../../../config/environment', () => ({
      API_BASE_URL: 'http://localhost:8080',
    }));

    const postMock = jest.fn().mockResolvedValue({
      data: {
        accessToken: 'session-token',
        user: {
          id: '1',
          name: 'admin@alovecino.com',
          email: 'admin@alovecino.com',
        },
      },
    });

    jest.doMock('../../../shared/api/httpClient', () => ({
      httpClient: {
        post: postMock,
      },
    }));

    const loginService = loadLoginService();
    const response = await loginService({
      email: 'admin@alovecino.com',
      password: 'admin1234',
    });

    expect(postMock).toHaveBeenCalledWith('/auth/login', {
      email: 'admin@alovecino.com',
      password: 'admin1234',
    });
    expect(response).toEqual({
      accessToken: 'session-token',
      user: {
        id: '1',
        name: 'admin@alovecino.com',
        email: 'admin@alovecino.com',
      },
    });
  });

  it('propaga errores del backend para que la pantalla muestre feedback', async () => {
    jest.doMock('../../../config/environment', () => ({
      API_BASE_URL: 'http://localhost:8080',
    }));

    const error = new Error('Credenciales invalidas');
    const postMock = jest.fn().mockRejectedValue(error);
    jest.doMock('../../../shared/api/httpClient', () => ({
      httpClient: {
        post: postMock,
      },
    }));

    const loginService = loadLoginService();

    await expect(loginService({
      email: 'admin@alovecino.com',
      password: 'wrong-password',
    })).rejects.toThrow('Credenciales invalidas');
    expect(postMock).toHaveBeenCalledWith('/auth/login', {
      email: 'admin@alovecino.com',
      password: 'wrong-password',
    });
  });
});
