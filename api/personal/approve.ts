import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { requireAdmin } from '../_lib/adminSession';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const session = requireAdmin(req, res);
    if (!session) return;

    const { publicId } = req.body || {};
    if (!publicId) {
        return res.status(400).json({ message: 'publicId is required' });
    }

    const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL;
    if (!dbUrl) {
        return res.status(503).json({ message: 'DATABASE_URL not configured on this server.' });
    }

    try {
        const sql = neon(dbUrl);
        const rows = await sql(
            `UPDATE personal_uploads
             SET status = 'approved', approved_at = NOW(), approved_by = $1
             WHERE public_id = $2 AND status = 'pending'
             RETURNING id, public_id, secure_url, resource_type, format, bytes, folder, status, approved_at`,
            [session.role, String(publicId)]
        );

        if (!rows.length) {
            return res.status(404).json({ message: 'Upload not found or already approved' });
        }

        return res.status(200).json({ message: 'Approved and published', upload: rows[0] });
    } catch (error: any) {
        console.error('[approve] error:', error?.message);
        return res.status(500).json({ message: 'Approval failed', error: error?.message ?? 'Unknown' });
    }
}