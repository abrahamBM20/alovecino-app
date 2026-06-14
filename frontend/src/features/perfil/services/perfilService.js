import { httpClient } from '../../../shared/api/httpClient';
import { API_BASE_URL } from '../../../config/environment';

function isMockEnvironment() {
  return API_BASE_URL.includes('example.com');
}

const MOCK_PERFIL = {
  idUsuario: 1,
  uuid: '1',
  rut: '12.345.678-9',
  nombreUsuario: 'demo.cliente',
  nombre: 'Demo Cliente',
  correo: 'demo.cliente@alovecino.test',
  nombreRol: 'CLIENTE',
  fotoPerfil: null,
  cliente: {
    idCliente: 1,
    fechaNacimiento: '1990-03-20',
    estadoCuenta: { codigo: 'ACTIVO', nombre: 'Activo' },
    direccion: {
      calle: 'Los Leones',
      numero: '456',
      codigoPostal: '7550000',
      comuna: 'Las Condes',
      region: 'Metropolitana de Santiago',
      latitud: -33.4172,
      longitud: -70.5988,
    },
  },
  almacenes: [],
};

export async function getPerfilUsuario(idUsuario) {
  if (isMockEnvironment()) {
    return MOCK_PERFIL;
  }

  const { data } = await httpClient.get(`/api/usuarios/${idUsuario}/profile`);
  return data;
}

export async function updatePerfilUsuario(idUsuario, payload) {
  if (isMockEnvironment()) {
    return { ...MOCK_PERFIL, ...payload };
  }

  const { data } = await httpClient.patch(`/api/usuarios/${idUsuario}/perfil`, payload);
  return data;
}
