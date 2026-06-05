-- Align consulta model with MER: consulta is the header and consulta_detalle stores requested items.
CREATE TABLE consulta_detalle (
    id_consulta_detalle BIGSERIAL PRIMARY KEY,
    id_consulta BIGINT NOT NULL,
    descripcion TEXT NOT NULL,
    cantidad_solicitada INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_consulta_detalle_consulta FOREIGN KEY (id_consulta) REFERENCES consulta(id_consulta) ON DELETE CASCADE,
    CONSTRAINT chk_consulta_detalle_cantidad CHECK (cantidad_solicitada > 0)
);

CREATE INDEX idx_consulta_detalle_id_consulta ON consulta_detalle(id_consulta);

INSERT INTO consulta_detalle (id_consulta, descripcion, cantidad_solicitada, created_at, updated_at)
SELECT
    id_consulta,
    descripcion,
    cantidad,
    COALESCE(created_at, CURRENT_TIMESTAMP),
    COALESCE(updated_at, CURRENT_TIMESTAMP)
FROM consulta
WHERE descripcion IS NOT NULL
  AND cantidad IS NOT NULL
  AND cantidad > 0;
