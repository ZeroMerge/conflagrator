import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac } from 'node:crypto';

// ── Inline session verification (mirrors login.ts exactly) ─────────────────
function sessionSecret() {
    return process.env.ADMIN_SESSION_SECRET || process.env.SESSION_SECRET || 'dev-secret-change-me';
}
function cookieName() {
    return process.env.SESSION_COOKIE || 'admin_session';
}
function verifyToken(token: string): boolean {
    try {
        const [enc, sig] = token.split('.');
        if (!enc || !sig) return false;
        const expected = createHmac('sha256', sessionSecret()).update(enc).digest('base64url');
        if (sig !== expected) return false;
        const payload = JSON.parse(Buffer.from(enc, 'base64url').toString('utf8'));
        return payload.role === 'admin' && typeof payload.exp === 'number' && payload.exp > Math.floor(Date.now() / 1000);
    } catch {
        return false;
    }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const raw = req.headers.cookie || '';
    const name = cookieName();
    const match = raw.split(';').map((c) => c.trim()).find((c) => c.startsWith(`${name}=`));

    if (!match) {
        return res.status(401).json({ authenticated: false });
    }

    const token = decodeURIComponent(match.slice(name.length + 1));
    if (!verifyToken(token)) {
        return res.status(401).json({ authenticated: false });
    }

    return res.status(200).json({ authenticated: true, role: 'admin' });
}
