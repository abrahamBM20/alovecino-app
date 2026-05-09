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
});
