-- Tabla para auditoría de llamadas a Google Geocoding API
-- CA-04: Límite diario configurable para llamadas a Google Geocoding

CREATE TABLE IF NOT EXISTS geocode_audit (
    id_geocode_audit BIGSERIAL PRIMARY KEY,
    id_usuario BIGINT NOT NULL,
    direccion VARCHAR(500) NOT NULL,
    fecha_llamada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resultado VARCHAR(20),
    
    -- Índice para búsquedas rápidas de conteo diario
    INDEX idx_usuario_fecha (id_usuario, DATE(fecha_llamada))
);

-- Índice adicional para auditoría
CREATE INDEX IF NOT EXISTS idx_geocode_resultado ON geocode_audit(resultado);
