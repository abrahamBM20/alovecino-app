BEGIN;

ALTER TABLE refresh_token DROP CONSTRAINT IF EXISTS chk_refresh_token_expira_despues;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'refresh_token'
          AND column_name = 'token_hash'
    ) THEN
        ALTER TABLE refresh_token RENAME COLUMN token_hash TO hash_token;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'refresh_token'
          AND column_name = 'created_at'
    ) THEN
        ALTER TABLE refresh_token RENAME COLUMN created_at TO fecha_creacion;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'refresh_token'
          AND column_name = 'expires_at'
    ) THEN
        ALTER TABLE refresh_token RENAME COLUMN expires_at TO fecha_expiracion;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'refresh_token'
          AND column_name = 'revoked_at'
    ) THEN
        ALTER TABLE refresh_token RENAME COLUMN revoked_at TO fecha_revocacion;
    END IF;
END $$;

ALTER INDEX IF EXISTS idx_refresh_token_expires_at RENAME TO idx_refresh_token_fecha_expiracion;
ALTER INDEX IF EXISTS idx_refresh_token_revoked_at RENAME TO idx_refresh_token_fecha_revocacion;

ALTER TABLE refresh_token
    ADD CONSTRAINT chk_refresh_token_expira_despues
    CHECK (fecha_expiracion > fecha_creacion);

COMMIT;
