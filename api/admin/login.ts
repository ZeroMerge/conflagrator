import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-me-now';
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || process.env.SESSION_SECRET || 'replace-this-in-production';
const SESSION_COOKIE = process.env.SESSION_COOKIE || 'admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 12;

function base64UrlEncode(value: string) {
    return Buffer.from(value).toString('base64url');
}

function sign(data: string) {
    return crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
}

function createToken() {
    const payload = { role: 'admin', exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS };
    const encoded = base64UrlEncode(JSON.stringify(payload));
    return `${encoded}.${sign(encoded)}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        if (req.method !== 'POST') {
            return res.status(405).json({ message: 'Method not allowed' });
        }

        const password = typeof req.body?.password === 'string' ? req.body.password.trim() : '';
        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }

        if (password !== ADMIN_PASSWORD) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = createToken();
        const isProd = process.env.NODE_ENV === 'production';
        res.setHeader(
            'Set-Cookie',
            `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; Path=/; Max-Age=${SESSION_TTL_SECONDS}; SameSite=Lax${isProd ? '; Secure' : ''}`
        );

        return res.status(200).json({ ok: true });
    } catch (err: any) {
        console.error('[admin/login] error:', err);
        return res.status(500).json({
            message: 'Server error',
            detail: err?.message ?? String(err),
        });
    }
}
