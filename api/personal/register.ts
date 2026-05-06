import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL;
    if (!dbUrl) {
        return res.status(503).json({ message: 'DATABASE_URL not configured on this server.' });
    }

    try {
        const { publicId, secureUrl, resourceType, format, bytes, folder } = req.body || {};

        if (!publicId || !secureUrl || !resourceType) {
            return res.status(400).json({ message: 'publicId, secureUrl, and resourceType are required' });
        }

        const sql = neon(dbUrl);

        const rows = await sql(
            `INSERT INTO personal_uploads (public_id, secure_url, resource_type, format, bytes, folder, status)
             VALUES ($1, $2, $3, $4, $5, $6, 'pending')
             ON CONFLICT (public_id) DO UPDATE SET
               secure_url = EXCLUDED.secure_url, resource_type = EXCLUDED.resource_type,
               format = EXCLUDED.format, bytes = EXCLUDED.bytes, folder = EXCLUDED.folder,
               status = 'pending', approved_at = NULL, approved_by = NULL, created_at = NOW()
             RETURNING *`,
            [
                String(publicId),
                String(secureUrl),
                resourceType === 'video' ? 'video' : 'image',
                format ? String(format) : null,
                bytes == null ? null : Number(bytes),
                folder ? String(folder) : null,
            ]
        );

        return res.status(200).json({ message: 'Upload registered for review', upload: rows[0] });
    } catch (error: any) {
        const msg = error?.message ?? 'Unknown';
        console.error('[register] Neon error:', msg);
        return res.status(500).json({
            message: 'Database query failed',
            detail: msg,
            hint: msg.includes('does not exist')
                ? 'The personal_uploads table is missing. Run database/personal_uploads.sql in your Neon dashboard.'
                : msg.includes('password') || msg.includes('auth')
                ? 'DATABASE_URL password is wrong. Check Vercel env vars.'
                : 'Check Vercel Function logs for details.',
        });
    }
}
