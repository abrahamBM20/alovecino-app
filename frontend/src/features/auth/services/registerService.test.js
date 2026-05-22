describe('registerService', () => {
  const formData = {
    tipoUsuario: 'cliente',
    rut: '12345678-5',
    nombreUsuario: 'maria.pena',
    nombreCompleto: 'María José Peña',
    fechaNacimiento: '12/10/1992',
    nombreAlmacen: '',
    calle: 'Los Alerces',
    numero: '123',
    comuna: 'Santiago',
    region: 'Metropolitana',
    codigoPostal: '',
    email: 'maria.pena@example.com',
    password: 'Password123',
  };

  function loadRegisterService() {
    let registerService;
    let buildRegisterPayload;

    jest.isolateModules(() => {
      ({ registerService, buildRegisterPayload } = require('./registerService'));
    });

    return { registerService, buildRegisterPayload };
  }

  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('mapea el formulario cliente al contrato actualizado del backend', () => {
    const { buildRegisterPayload } = loadRegisterService();

    expect(buildRegisterPayload(formData)).toEqual({
      rut: '12345678-5',
      nombreUsuario: 'maria.pena',
      nombre: 'María José Peña',
      correo: 'maria.pena@example.com',
      contrasena: 'Password123',
      tipoCuenta: 'CLIENTE',
      fechaNacimiento: '1992-10-12',
      direccion: {
        calle: 'Los Alerces',
        numero: '123',
        comuna: 'Santiago',
        region: 'Metropolitana',
        codigoPostal: null,
      },
    });
  });

  it('mapea el formulario almacén con nombreAlmacen y sin fechaNacimiento', () => {
    const { buildRegisterPayload } = loadRegisterService();

    expect(buildRegisterPayload({
      ...formData,
      tipoUsuario: 'almacen',
      fechaNacimiento: '',
      nombreAlmacen: 'Minimarket Central',
    })).toMatchObject({
      tipoCuenta: 'ALMACEN',
      nombreAlmacen: 'Minimarket Central',
    });
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

    const { registerService } = loadRegisterService();
    await expect(registerService(formData)).resolves.toEqual({ success: true });
    expect(postMock).not.toHaveBeenCalled();
  });

  it('envía el payload actualizado al gateway cuando hay API real', async () => {
    jest.doMock('../../../config/environment', () => ({
      API_BASE_URL: 'https://alovecino-api-gateway-dev.onrender.com',
    }));

    const postMock = jest.fn().mockResolvedValue({ data: { id: 1 } });
    jest.doMock('../../../shared/api/httpClient', () => ({
      httpClient: {
        post: postMock,
      },
    }));

    const { registerService } = loadRegisterService();
    await registerService(formData);

    expect(postMock).toHaveBeenCalledWith('/api/usuarios', expect.objectContaining({
      rut: '12345678-5',
      nombreUsuario: 'maria.pena',
      nombre: 'María José Peña',
      correo: 'maria.pena@example.com',
      contrasena: 'Password123',
      tipoCuenta: 'CLIENTE',
      fechaNacimiento: '1992-10-12',
    }));
  });
});
