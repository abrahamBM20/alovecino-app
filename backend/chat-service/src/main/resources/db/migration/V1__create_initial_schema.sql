-- Create usuario table
CREATE TABLE usuario (
    id_usuario BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create cliente table
CREATE TABLE cliente (
    id_cliente BIGSERIAL PRIMARY KEY,
    id_usuario BIGINT NOT NULL,
    direccion TEXT,
    ciudad VARCHAR(100),
    codigo_postal VARCHAR(10),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cliente_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

-- Create almacen table
CREATE TABLE almacen (
    id_almacen BIGSERIAL PRIMARY KEY,
    id_usuario BIGINT NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    direccion TEXT,
    ciudad VARCHAR(100),
    codigo_postal VARCHAR(10),
    telefono VARCHAR(20),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_almacen_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

-- Create configuracion_usuario table
CREATE TABLE configuracion_usuario (
    id_configuracion BIGSERIAL PRIMARY KEY,
    id_usuario BIGINT NOT NULL,
    notificaciones_email BOOLEAN NOT NULL DEFAULT TRUE,
    notificaciones_push BOOLEAN NOT NULL DEFAULT TRUE,
    idioma VARCHAR(10) DEFAULT 'es',
    zona_horaria VARCHAR(50) DEFAULT 'America/Mexico_City',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_configuracion_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

-- Create estado_consulta table
CREATE TABLE estado_consulta (
    id_estado_consulta BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create consulta table
CREATE TABLE consulta (
    id_consulta BIGSERIAL PRIMARY KEY,
    descripcion TEXT,
    cantidad INTEGER,
    id_cliente BIGINT,
    id_almacen BIGINT,
    fecha_respuesta TIMESTAMP WITH TIME ZONE,
    respuesta TEXT,
    id_estado_consulta BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_consulta_estado_consulta FOREIGN KEY (id_estado_consulta) REFERENCES estado_consulta(id_estado_consulta),
    CONSTRAINT fk_consulta_almacen FOREIGN KEY (id_almacen) REFERENCES almacen(id_almacen) ON DELETE CASCADE,
    CONSTRAINT fk_consulta_cliente FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente) ON DELETE CASCADE
);

-- Create indexes
CREATE UNIQUE INDEX idx_usuario_email ON usuario(email);
CREATE INDEX idx_cliente_id_usuario ON cliente(id_usuario);
CREATE INDEX idx_almacen_id_usuario ON almacen(id_usuario);
CREATE INDEX idx_configuracion_usuario_id_usuario ON configuracion_usuario(id_usuario);
CREATE INDEX idx_consulta_id_cliente ON consulta(id_cliente);
CREATE INDEX idx_consulta_id_almacen ON consulta(id_almacen);
CREATE INDEX idx_consulta_id_estado_consulta ON consulta(id_estado_consulta);

-- Insert default estados de consulta
INSERT INTO estado_consulta (nombre, descripcion) VALUES
('PENDIENTE', 'Consulta creada pero no respondida aún'),
('RESPONDIDA', 'Consulta que ha sido respondida por el almacén'),
('CERRADA', 'Consulta finalizada'),
('CANCELADA', 'Consulta cancelada por el cliente');