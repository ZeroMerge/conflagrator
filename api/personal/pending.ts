import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { createHmac } from 'node:crypto';

function sessionSecret() {
    return process.env.ADMIN_SESSION_SECRET || process.env.SESSION_SECRET || 'dev-secret-change-me';
}
function cookieName() { return process.env.SESSION_COOKIE || 'admin_session'; }
function requireAdmin(req: VercelRequest, res: VercelResponse): boolean {
    const raw = req.headers.cookie || '';
    const name = cookieName();
    const match = raw.split(';').map(c => c.trim()).find(c => c.startsWith(`${name}=`));
    if (!match) { res.status(401).json({ message: 'Not authenticated' }); return false; }
    const token = decodeURIComponent(match.slice(name.length + 1));
    try {
        const [enc, sig] = token.split('.');
        if (!enc || !sig) { res.status(401).json({ message: 'Bad token' }); return false; }
        const expected = createHmac('sha256', sessionSecret()).update(enc).digest('base64url');
        if (sig !== expected) { res.status(401).json({ message: 'Bad token' }); return false; }
        const payload = JSON.parse(Buffer.from(enc, 'base64url').toString('utf8'));
        if (payload.role !== 'admin' || payload.exp < Math.floor(Date.now() / 1000)) {
            res.status(401).json({ message: 'Session expired' }); return false;
        }
        return true;
    } catch { res.status(401).json({ message: 'Invalid session' }); return false; }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });
    if (!requireAdmin(req, res)) return;

    const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL;
    if (!dbUrl) return res.status(503).json({ message: 'DATABASE_URL not configured' });

    try {
        const sql = neon(dbUrl);
        // Tagged template — new required syntax for @neondatabase/serverless
        const rows = await sql`
            SELECT id, public_id, secure_url, resource_type, format, bytes, folder, status, created_at
            FROM personal_uploads
            WHERE status = 'pending'
            ORDER BY created_at DESC
        `;
        return res.status(200).json({ items: rows });
    } catch (error: any) {
        const msg = error?.message ?? 'Unknown';
        console.error('[pending] error:', msg);
        return res.status(500).json({ message: 'Database query failed', detail: msg });
    }
}