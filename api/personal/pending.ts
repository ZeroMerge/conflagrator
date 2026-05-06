import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminSession';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    if (!requireAdmin(req, res)) return;

    const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL;
    if (!dbUrl) {
        return res.status(503).json({ message: 'Database not configured' });
    }

    try {
        const { neon } = await import('@neondatabase/serverless');
        const sql = neon(dbUrl);

        const rows = await sql(
            `SELECT id, public_id, secure_url, resource_type, format, bytes, folder, status, created_at
             FROM personal_uploads
             WHERE status = 'pending'
             ORDER BY created_at DESC`
        );

        return res.status(200).json({ items: rows });
    } catch (error: any) {
        console.error('[pending] error:', error);
        return res.status(500).json({
            message: 'Failed to load pending uploads',
            error: error?.message ?? 'Unknown error',
        });
    }
}