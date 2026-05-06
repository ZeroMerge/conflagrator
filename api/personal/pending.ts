import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { createHmac } from 'node:crypto';

// ── Inline admin auth (no _lib imports) ────────────────────────────────────
function getSessionSecret() {
    return process.env.ADMIN_SESSION_SECRET || process.env.SESSION_SECRET || 'dev-secret-change-me';
}
function cookieName() {
    return process.env.SESSION_COOKIE || 'admin_session';
}
function verifyToken(token: string): boolean {
    try {
        const [enc, sig] = token.split('.');
        if (!enc || !sig) return false;
        const expected = createHmac('sha256', getSessionSecret()).update(enc).digest('base64url');
        if (sig !== expected) return false;
        const payload = JSON.parse(Buffer.from(enc, 'base64url').toString('utf8'));
        return payload.role === 'admin' && typeof payload.exp === 'number' && payload.exp > Math.floor(Date.now() / 1000);
    } catch {
        return false;
    }
}
function requireAdmin(req: VercelRequest, res: VercelResponse): boolean {
    const raw = req.headers.cookie || '';
    const name = cookieName();
    const match = raw.split(';').map((c) => c.trim()).find((c) => c.startsWith(`${name}=`));
    if (!match) {
        res.status(401).json({ message: 'Not authenticated' });
        return false;
    }
    const token = decodeURIComponent(match.slice(name.length + 1));
    if (!verifyToken(token)) {
        res.status(401).json({ message: 'Invalid or expired session' });
        return false;
    }
    return true;
}

// ── Handler ────────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    if (!requireAdmin(req, res)) return;

    const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL;
    if (!dbUrl) {
        return res.status(503).json({
            message: 'DATABASE_URL is not set in Vercel environment variables. Go to Vercel → Settings → Environment Variables and add it.',
        });
    }

    try {
        const sql = neon(dbUrl);
        const rows = await sql(
            `SELECT id, public_id, secure_url, resource_type, format, bytes, folder, status, created_at
             FROM personal_uploads WHERE status = 'pending' ORDER BY created_at DESC`
        );
        return res.status(200).json({ items: rows });
    } catch (error: any) {
        const msg = error?.message ?? 'Unknown';
        console.error('[pending] Neon error:', msg);
        // Surface the real error so you can diagnose it
        return res.status(500).json({
            message: 'Database query failed',
            detail: msg,
            hint: msg.includes('does not exist')
                ? 'Run the SQL in database/personal_uploads.sql in your Neon dashboard to create the table.'
                : msg.includes('password') || msg.includes('auth')
                ? 'Check that DATABASE_URL in Vercel has the correct password.'
                : 'Check Vercel Function logs for the full stack trace.',
        });
    }
}