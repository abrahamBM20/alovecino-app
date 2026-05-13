import { registerSchema } from './registerSchema';

describe('registerSchema', () => {
  const validClient = {
    tipoUsuario: 'cliente',
    rut: '12345678-5',
    nombreUsuario: 'maria.pena',
    nombreCompleto: 'María José Peña Núñez',
    fechaNacimiento: '12/10/1992',
    nombreAlmacen: '',
    calle: 'Los Alerces',
    numero: '123',
    comuna: 'Santiago',
    region: 'Metropolitana',
    codigoPostal: '',
    email: 'maria.pena@example.com',
    password: 'Password123',
    confirmarPassword: 'Password123',
  };

  it('acepta nombres con caracteres del español latinoamericano', () => {
    const result = registerSchema.safeParse(validClient);

    expect(result.success).toBe(true);
  });

  it('acepta RUT válido con cuerpo de 7 dígitos', () => {
    const result = registerSchema.safeParse({
      ...validClient,
      rut: '1234567-4',
    });

    expect(result.success).toBe(true);
  });

  it('acepta RUT válido con puntos', () => {
    const result = registerSchema.safeParse({
      ...validClient,
      rut: '12.345.678-5',
    });

    expect(result.success).toBe(true);
  });

  it('acepta RUT válido sin guion', () => {
    const result = registerSchema.safeParse({
      ...validClient,
      rut: '123456785',
    });

    expect(result.success).toBe(true);
  });

  it('acepta ñ y tildes en campos de texto', () => {
    const result = registerSchema.safeParse({
      ...validClient,
      nombreUsuario: 'niñez.pública',
      nombreCompleto: 'Ñusta Camila Muñoz Álvarez',
      calle: 'Pasaje Ñuble',
      comuna: 'Peñalolén',
      region: 'Biobío',
    });

    expect(result.success).toBe(true);
  });

  it('rechaza RUT con digito verificador inválido', () => {
    const result = registerSchema.safeParse({
      ...validClient,
      rut: '12345678-9',
    });

    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe('Ingresa un RUT válido');
  });

  it('exige fecha de nacimiento solo para clientes', () => {
    const clientResult = registerSchema.safeParse({
      ...validClient,
      fechaNacimiento: '',
    });
    const storeResult = registerSchema.safeParse({
      ...validClient,
      tipoUsuario: 'almacen',
      fechaNacimiento: '',
      nombreAlmacen: 'Almacén Ñuñoa',
    });

    expect(clientResult.success).toBe(false);
    expect(storeResult.success).toBe(true);
  });

  it('exige nombre de almacén para cuentas almacén', () => {
    const result = registerSchema.safeParse({
      ...validClient,
      tipoUsuario: 'almacen',
      nombreAlmacen: '',
    });

    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe('Ingresa el nombre del almacén');
  });
});
