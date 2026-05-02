import { almacenSchema } from './almacenSchema';

describe('almacenSchema', () => {
  it('acepta nombres, direcciones y comunas con caracteres del español latinoamericano', () => {
    const result = almacenSchema.safeParse({
      nombre: 'Almacén Doña Ñata',
      direccion: 'Av. Libertador Bernardo O’Higgins 1234 #5',
      comuna: 'Ñuñoa',
      telefono: '+56 9 1234 5678',
    });

    expect(result.success).toBe(true);
  });
});
