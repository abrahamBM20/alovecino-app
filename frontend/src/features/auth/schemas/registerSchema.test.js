import { registerSchema } from './registerSchema';

describe('registerSchema', () => {
  it('acepta nombres con caracteres del español latinoamericano', () => {
    const result = registerSchema.safeParse({
      tipoUsuario: 'cliente',
      nombreCompleto: "María José Peña Núñez",
      fechaNacimiento: '12/10/1992',
      email: 'maria.pena@example.com',
      password: 'Password123',
      confirmarPassword: 'Password123',
    });

    expect(result.success).toBe(true);
  });
});
