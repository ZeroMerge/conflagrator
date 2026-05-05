import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

const loadLocalEnv = () => {
    const envPath = path.join(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) return;

    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;

        const [rawKey, ...rawValueParts] = trimmed.split('=');
        const key = rawKey.trim();
        const value = rawValueParts.join('=').trim().replace(/^['"]|['"]$/g, '');

        if (!process.env[key] && key) {
            process.env[key] = value;
        }
    }
};

loadLocalEnv();

export type PersonalUploadStatus = 'pending' | 'approved';
export type PersonalUploadResourceType = 'image' | 'video';

export type PersonalUploadRecord = {
    id: string;
    publicId: string;
    secureUrl: string;
    resourceType: PersonalUploadResourceType;
    format: string | null;
    bytes: number | null;
    folder: string | null;
    status: PersonalUploadStatus;
    createdAt: string;
    approvedAt: string | null;
    approvedBy: string | null;
};

const getDatabaseUrl = () => {
    return process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL;
};

const hasPostgresConnection = () => Boolean(getDatabaseUrl());

const requireDatabase = () => {
    if (!hasPostgresConnection()) {
        throw new Error('Neon database is not configured. Set DATABASE_URL or POSTGRES_URL in environment variables.');
    }
};

let sql: ReturnType<typeof neon> | null = null;

const getSqlClient = () => {
    if (!sql) {
        const dbUrl = getDatabaseUrl();
        if (!dbUrl) {
            throw new Error('Database URL not found');
        }
        sql = neon(dbUrl);
    }
    return sql;
};

const rowToRecord = (row: any): PersonalUploadRecord => ({
    id: row.id,
    publicId: row.public_id,
    secureUrl: row.secure_url,
    resourceType: row.resource_type,
    format: row.format,
    bytes: row.bytes == null ? null : Number(row.bytes),
    folder: row.folder,
    status: row.status,
    createdAt: row.created_at,
    approvedAt: row.approved_at,
    approvedBy: row.approved_by,
});

export const upsertPendingUpload = async (input: {
    publicId: string;
    secureUrl: string;
    resourceType: PersonalUploadResourceType;
    format?: string | null;
    bytes?: number | null;
    folder?: string | null;
}) => {
    requireDatabase();

    const sql = getSqlClient();
    const result = await sql(
        `INSERT INTO personal_uploads (
            public_id,
            secure_url,
            resource_type,
            format,
            bytes,
            folder,
            status
        ) VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            'pending'
        )
        ON CONFLICT (public_id)
        DO UPDATE SET
            secure_url = EXCLUDED.secure_url,
            resource_type = EXCLUDED.resource_type,
            format = EXCLUDED.format,
            bytes = EXCLUDED.bytes,
            folder = EXCLUDED.folder,
            status = 'pending',
            approved_at = NULL,
            approved_by = NULL,
            created_at = NOW()
        RETURNING *;`,
        [
            input.publicId,
            input.secureUrl,
            input.resourceType,
            input.format ?? null,
            input.bytes ?? null,
            input.folder ?? null,
        ]
    );

    return rowToRecord(result[0]);
};

export const listPendingUploads = async () => {
    requireDatabase();

    const sql = getSqlClient();
    const result = await sql(
        `SELECT *
        FROM personal_uploads
        WHERE status = 'pending'
        ORDER BY created_at DESC;`
    );

    return result.map(rowToRecord);
};

export const listApprovedUploads = async () => {
    requireDatabase();

    const sql = getSqlClient();
    const result = await sql(
        `SELECT *
        FROM personal_uploads
        WHERE status = 'approved'
        ORDER BY approved_at DESC NULLS LAST, created_at DESC;`
    );

    return result.map(rowToRecord);
};

export const approveUpload = async (publicId: string, approvedBy: string = 'admin') => {
    requireDatabase();

    const sql = getSqlClient();
    const result = await sql(
        `UPDATE personal_uploads
        SET
            status = 'approved',
            approved_at = NOW(),
            approved_by = $2
        WHERE public_id = $1
        RETURNING *;`,
        [publicId, approvedBy]
    );

    if (!result || result.length === 0) {
        throw new Error('Upload not found');
    }

    return rowToRecord(result[0]);
};
