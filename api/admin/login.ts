import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createAdminSessionToken, setAdminSessionCookie } from '../_lib/adminSession';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-me-now';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const password = typeof req.body?.password === 'string' ? req.body.password.trim() : '';
    if (!password || typeof password !== 'string') {
        return res.status(400).json({ message: 'Password is required' });
    }

    if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = createAdminSessionToken();
    setAdminSessionCookie(res, token);

    return res.status(200).json({ ok: true });
}
