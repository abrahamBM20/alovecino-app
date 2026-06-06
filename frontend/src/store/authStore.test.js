const mockLoginService = jest.fn();
const mockLogoutService = jest.fn();
const mockRefreshSessionService = jest.fn();
const mockMapApiError = jest.fn((error) => error?.message || 'Error mapeado');

jest.mock('../features/auth/services/authService', () => ({
  loginService: (...args) => mockLoginService(...args),
  logoutService: (...args) => mockLogoutService(...args),
  refreshSessionService: (...args) => mockRefreshSessionService(...args),
}));

jest.mock('../shared/api/errorMapper', () => ({
  mapApiError: (...args) => mockMapApiError(...args),
}));

jest.mock('@react-native-async-storage/async-storage', () => (
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
));

describe('useAuthStore', () => {
  let useAuthStore;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    ({ useAuthStore } = require('./authStore'));
    useAuthStore.setState({
      status: 'unauthenticated',
      user: null,
      accessToken: null,
      refreshToken: null,
      accessTokenExpiresAt: null,
      refreshTokenExpiresAt: null,
      isLoading: false,
      error: null,
    });
  });

  it('autentica y persiste los datos de sesion cuando el login es exitoso', async () => {
    mockLoginService.mockResolvedValue({
      accessToken: 'token-qa',
      refreshToken: 'refresh-qa',
      accessTokenExpiresAt: '2026-06-05T12:15:00Z',
      refreshTokenExpiresAt: '2026-07-05T12:00:00Z',
      user: {
        id: '42',
        name: 'QA User',
        email: 'qa@alovecino.test',
      },
    });

    await useAuthStore.getState().login({
      email: 'qa@alovecino.test',
      password: 'Password123',
    });

    expect(mockLoginService).toHaveBeenCalledWith({
      email: 'qa@alovecino.test',
      password: 'Password123',
    });
    expect(useAuthStore.getState()).toMatchObject({
      status: 'authenticated',
      accessToken: 'token-qa',
      refreshToken: 'refresh-qa',
      accessTokenExpiresAt: '2026-06-05T12:15:00Z',
      refreshTokenExpiresAt: '2026-07-05T12:00:00Z',
      user: {
        email: 'qa@alovecino.test',
      },
      isLoading: false,
      error: null,
    });
  });

  it('limpia la sesion y expone error mapeado cuando falla el login', async () => {
    const error = new Error('Credenciales invalidas');
    mockLoginService.mockRejectedValue(error);
    mockMapApiError.mockReturnValue('Correo o contraseña incorrectos');

    await expect(useAuthStore.getState().login({
      email: 'qa@alovecino.test',
      password: 'wrong-password',
    })).rejects.toThrow('Credenciales invalidas');

    expect(mockMapApiError).toHaveBeenCalledWith(error);
    expect(useAuthStore.getState()).toMatchObject({
      status: 'unauthenticated',
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: 'Correo o contraseña incorrectos',
    });
  });

  it('renueva la sesion y rota tokens cuando el refresh remoto es exitoso', async () => {
    useAuthStore.setState({
      status: 'authenticated',
      user: { id: '42', email: 'qa@alovecino.test' },
      accessToken: 'access-old',
      refreshToken: 'refresh-old',
      error: 'error anterior',
    });
    mockRefreshSessionService.mockResolvedValue({
      accessToken: 'access-new',
      refreshToken: 'refresh-new',
      accessTokenExpiresAt: '2026-06-05T12:30:00Z',
      refreshTokenExpiresAt: '2026-07-05T12:00:00Z',
    });

    await expect(useAuthStore.getState().refreshSession()).resolves.toBe('access-new');

    expect(mockRefreshSessionService).toHaveBeenCalledWith({ refreshToken: 'refresh-old' });
    expect(useAuthStore.getState()).toMatchObject({
      status: 'authenticated',
      accessToken: 'access-new',
      refreshToken: 'refresh-new',
      accessTokenExpiresAt: '2026-06-05T12:30:00Z',
      refreshTokenExpiresAt: '2026-07-05T12:00:00Z',
      user: { email: 'qa@alovecino.test' },
      error: null,
    });
  });

  it('limpia la sesion cuando no existe refresh token local', async () => {
    useAuthStore.setState({
      status: 'authenticated',
      user: { id: '42', email: 'qa@alovecino.test' },
      accessToken: 'access-old',
      refreshToken: null,
    });

    await expect(useAuthStore.getState().refreshSession()).rejects.toThrow('Refresh token no disponible');

    expect(mockRefreshSessionService).not.toHaveBeenCalled();
    expect(useAuthStore.getState()).toMatchObject({
      status: 'unauthenticated',
      user: null,
      accessToken: null,
      refreshToken: null,
    });
  });

  it('cierra sesion local aunque el logout remoto falle', async () => {
    mockLogoutService.mockRejectedValue(new Error('Sesion remota ya cerrada'));
    useAuthStore.setState({
      status: 'authenticated',
      user: { id: '42', email: 'qa@alovecino.test' },
      accessToken: 'token-qa',
      refreshToken: 'refresh-qa',
      error: 'error anterior',
    });

    await useAuthStore.getState().logout();

    expect(mockLogoutService).toHaveBeenCalledWith('refresh-qa');
    expect(useAuthStore.getState()).toMatchObject({
      status: 'unauthenticated',
      user: null,
      accessToken: null,
      refreshToken: null,
      error: null,
    });
  });
});
