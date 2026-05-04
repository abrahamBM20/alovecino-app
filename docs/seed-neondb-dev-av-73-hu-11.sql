BEGIN;

INSERT INTO rol (id_rol, nombre_rol)
VALUES
    (1, 'CLIENTE'),
    (2, 'ALMACEN'),
    (3, 'ADMIN')
ON CONFLICT (id_rol) DO UPDATE SET nombre_rol = EXCLUDED.nombre_rol;

SELECT setval(pg_get_serial_sequence('rol', 'id_rol'), (SELECT max(id_rol) FROM rol));

INSERT INTO estado_cuenta (codigo, nombre, descripcion)
VALUES
    ('ACTIVO', 'Activo', 'Cuenta habilitada para operar'),
    ('PENDIENTE', 'Pendiente', 'Cuenta pendiente de revision o activacion'),
    ('SUSPENDIDO', 'Suspendido', 'Cuenta suspendida temporalmente'),
    ('RECHAZADO', 'Rechazado', 'Cuenta rechazada durante revision'),
    ('INACTIVO', 'Inactivo', 'Cuenta inactiva')
ON CONFLICT (codigo) DO UPDATE
SET nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion;

INSERT INTO estado_consulta (codigo, nombre, descripcion)
VALUES
    ('ABIERTA', 'Abierta', 'Consulta creada y pendiente de respuesta'),
    ('RESPONDIDA', 'Respondida', 'Consulta respondida por el almacen'),
    ('CERRADA', 'Cerrada', 'Consulta cerrada'),
    ('CANCELADA', 'Cancelada', 'Consulta cancelada')
ON CONFLICT (codigo) DO UPDATE
SET nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion;

INSERT INTO tipo_contacto (codigo, nombre)
VALUES
    ('TELEFONO', 'Telefono'),
    ('WHATSAPP', 'WhatsApp'),
    ('EMAIL', 'Correo electronico'),
    ('INSTAGRAM', 'Instagram')
ON CONFLICT (codigo) DO UPDATE
SET nombre = EXCLUDED.nombre;

INSERT INTO tipo_imagen (codigo, nombre)
VALUES
    ('LOGO', 'Logo'),
    ('FACHADA', 'Fachada'),
    ('GALERIA', 'Galeria')
ON CONFLICT (codigo) DO UPDATE
SET nombre = EXCLUDED.nombre;

INSERT INTO categoria_almacen (nombre, descripcion)
VALUES
    ('Minimarket', 'Almacen de abarrotes y productos de uso diario'),
    ('Botilleria', 'Venta de bebidas y alcoholes'),
    ('Panaderia', 'Venta de pan y productos horneados'),
    ('Verduleria', 'Venta de frutas y verduras'),
    ('Farmacia', 'Venta de medicamentos y productos de salud')
ON CONFLICT (nombre) DO UPDATE
SET descripcion = EXCLUDED.descripcion;

INSERT INTO region (nombre, codigo)
VALUES
    ('Arica y Parinacota', 'XV'),
    ('Tarapaca', 'I'),
    ('Antofagasta', 'II'),
    ('Atacama', 'III'),
    ('Coquimbo', 'IV'),
    ('Valparaiso', 'V'),
    ('Metropolitana de Santiago', 'RM'),
    ('Libertador General Bernardo OHiggins', 'VI'),
    ('Maule', 'VII'),
    ('Nuble', 'XVI'),
    ('Biobio', 'VIII'),
    ('La Araucania', 'IX'),
    ('Los Rios', 'XIV'),
    ('Los Lagos', 'X'),
    ('Aysen del General Carlos Ibanez del Campo', 'XI'),
    ('Magallanes y de la Antartica Chilena', 'XII')
ON CONFLICT (codigo) DO UPDATE
SET nombre = EXCLUDED.nombre;

COMMIT;
