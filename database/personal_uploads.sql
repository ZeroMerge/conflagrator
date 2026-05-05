CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS personal_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    public_id TEXT NOT NULL UNIQUE,
    secure_url TEXT NOT NULL,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('image', 'video')),
    format TEXT,
    bytes BIGINT,
    folder TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    approved_by TEXT
);

CREATE INDEX IF NOT EXISTS personal_uploads_status_created_at_idx
    ON personal_uploads (status, created_at DESC);

CREATE INDEX IF NOT EXISTS personal_uploads_approved_at_idx
    ON personal_uploads (approved_at DESC);
