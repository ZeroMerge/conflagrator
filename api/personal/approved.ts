import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL;

    if (!dbUrl) {
        // No DB — return empty so gallery just shows nothing (no crash)
        return res.status(200).json({ items: [] });
    }

    try {
        const sql = neon(dbUrl);
        const dbRows = await sql(
            `SELECT id, public_id, secure_url, resource_type, format, bytes, folder, status,
                    created_at, approved_at, approved_by
             FROM personal_uploads WHERE status = 'approved' ORDER BY approved_at DESC`
        );
        return res.status(200).json({ items: dbRows });
    } catch (err: any) {
        const msg = err?.message ?? 'Unknown';
        console.error('[approved] DB error:', msg);
        // Return empty instead of 500 so the gallery page doesn't break
        return res.status(200).json({ items: [], warning: msg });
    }
}
