import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL;
    if (!dbUrl) {
        return res.status(503).json({ message: 'DATABASE_URL not configured' });
    }

    try {
        const { publicId, secureUrl, resourceType, format, bytes, folder } = req.body || {};

        if (!publicId || !secureUrl || !resourceType) {
            return res.status(400).json({ message: 'publicId, secureUrl, and resourceType are required' });
        }

        const sql = neon(dbUrl);
        const safePublicId = String(publicId);
        const safeSecureUrl = String(secureUrl);
        const safeResourceType = resourceType === 'video' ? 'video' : 'image';
        const safeFormat = format ? String(format) : null;
        const safeBytes = bytes == null ? null : Number(bytes);
        const safeFolder = folder ? String(folder) : null;

        // Use tagged template (breaking change in @neondatabase/serverless)
        const rows = await sql`
            INSERT INTO personal_uploads (public_id, secure_url, resource_type, format, bytes, folder, status)
            VALUES (${safePublicId}, ${safeSecureUrl}, ${safeResourceType}, ${safeFormat}, ${safeBytes}, ${safeFolder}, 'pending')
            ON CONFLICT (public_id) DO UPDATE SET
                secure_url = EXCLUDED.secure_url,
                resource_type = EXCLUDED.resource_type,
                format = EXCLUDED.format,
                bytes = EXCLUDED.bytes,
                folder = EXCLUDED.folder,
                status = 'pending',
                approved_at = NULL,
                approved_by = NULL,
                created_at = NOW()
            RETURNING *
        `;

        return res.status(200).json({ message: 'Registered for review', upload: rows[0] });
    } catch (error: any) {
        const msg = error?.message ?? 'Unknown';
        console.error('[register] error:', msg);
        return res.status(500).json({ message: 'Database query failed', detail: msg });
    }
}
