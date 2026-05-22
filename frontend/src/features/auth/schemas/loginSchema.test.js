import { loginSchema } from './loginSchema';

describe('loginSchema', () => {
  it('acepta credenciales validas', () => {
    const result = loginSchema.safeParse({
      email: 'test@mail.com',
      password: '123456',
    });

    expect(result.success).toBe(true);
  });

  it('rechaza email invalido', () => {
    const result = loginSchema.safeParse({
      email: 'email-invalido',
      password: '123456',
    });

    expect(result.success).toBe(false);
  });

  it('rechaza password vacio o demasiado corto', () => {
    const result = loginSchema.safeParse({
      email: 'test@mail.com',
      password: '',
    });

    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe('La contraseña debe tener al menos 6 caracteres.');
  });
});
