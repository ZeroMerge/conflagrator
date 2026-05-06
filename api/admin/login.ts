import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
    createAdminSessionToken,
    setSessionCookie,
} from '../_lib/adminSession';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { password } = req.body || {};
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    if (!ADMIN_PASSWORD) {
        console.error('[admin/login] ADMIN_PASSWORD env var not set');
        return res.status(500).json({ message: 'Server misconfiguration: ADMIN_PASSWORD not set' });
    }

    if (!password || password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: 'Invalid password' });
    }

    const token = createAdminSessionToken();
    setSessionCookie(res, token);
    return res.status(200).json({ ok: true });
}
