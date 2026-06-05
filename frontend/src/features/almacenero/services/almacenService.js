import { httpClient } from '../../../shared/api/httpClient';

function compactJoin(parts, separator = ', ') {
  return parts
    .map((part) => (typeof part === 'string' ? part.trim() : part))
    .filter(Boolean)
    .join(separator);
}

export function mapAlmacen(apiAlmacen) {
  if (!apiAlmacen) return null;

  const calleNumero = compactJoin([apiAlmacen.calle, apiAlmacen.numero], ' ');
  const direccion = compactJoin([calleNumero, apiAlmacen.comuna, apiAlmacen.region]);

  return {
    id: apiAlmacen.idAlmacen,
    nombre: apiAlmacen.nombre,
    estado: apiAlmacen.estado,
    imagenUrl: apiAlmacen.imagenUrl,
    telefono: apiAlmacen.telefono,
    calle: apiAlmacen.calle,
    numero: apiAlmacen.numero,
    comuna: apiAlmacen.comuna,
    region: apiAlmacen.region,
    latitud: apiAlmacen.latitud,
    longitud: apiAlmacen.longitud,
    direccion,
  };
}

export async function fetchMisAlmacenes() {
  const { data } = await httpClient.get('/api/almacenes/mis-almacenes');
  return Array.isArray(data) ? data.map(mapAlmacen).filter(Boolean) : [];
}

export async function fetchAlmacenPerfil(idAlmacen) {
  const { data } = await httpClient.get(`/api/almacenes/${idAlmacen}`);
  return mapAlmacen(data);
}
