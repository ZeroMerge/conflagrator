import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac } from 'node:crypto';

// ── All session logic inline — no imports from local _lib files ────────────
const SESSION_TTL = 60 * 60 * 12; // 12 hours

function sessionSecret() {
    return process.env.ADMIN_SESSION_SECRET || process.env.SESSION_SECRET || 'dev-secret-change-me';
}
function cookieName() {
    return process.env.SESSION_COOKIE || 'admin_session';
}
function b64Encode(s: string) {
    return Buffer.from(s).toString('base64url');
}
function sign(data: string) {
    return createHmac('sha256', sessionSecret()).update(data).digest('base64url');
}
function makeToken() {
    const payload = JSON.stringify({ role: 'admin', exp: Math.floor(Date.now() / 1000) + SESSION_TTL });
    const enc = b64Encode(payload);
    return `${enc}.${sign(enc)}`;
}

// ── Handler ────────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    if (!ADMIN_PASSWORD) {
        // 503 = config problem (distinguishable from runtime crash 500)
        return res.status(503).json({
            message: 'ADMIN_PASSWORD is not set in Vercel environment variables.',
        });
    }

    const { password } = (req.body || {}) as { password?: string };
    if (!password || password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: 'Invalid password' });
    }

    const token = makeToken();
    const isProd = process.env.NODE_ENV === 'production';
    res.setHeader(
        'Set-Cookie',
        `${cookieName()}=${encodeURIComponent(token)}; HttpOnly; Path=/; Max-Age=${SESSION_TTL}; SameSite=Lax${isProd ? '; Secure' : ''}`
    );
    return res.status(200).json({ ok: true });
}
