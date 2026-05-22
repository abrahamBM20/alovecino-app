import { almacenSchema } from './almacenSchema';

describe('almacenSchema', () => {
  it('acepta datos de almacén geocodificables con caracteres del español latinoamericano', () => {
    const result = almacenSchema.safeParse({
      nombre: 'Almacén Doña Ñata',
      calle: 'Av. Libertador Bernardo O’Higgins',
      numero: '1234 #5',
      comuna: 'Ñuñoa',
      region: 'Metropolitana',
      codigoPostal: '8320000',
      telefono: '+56 9 1234 5678',
    });

    expect(result.success).toBe(true);
  });
});
