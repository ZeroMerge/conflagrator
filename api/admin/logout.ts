import type { VercelRequest, VercelResponse } from '@vercel/node';
import { clearAdminSessionCookie } from '../_lib/adminSession';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    clearAdminSessionCookie(res);
    return res.status(200).json({ ok: true });
}
