import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAdminSessionFromRequest } from '../_lib/adminSession';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const session = getAdminSessionFromRequest(req);
    if (!session) {
        return res.status(401).json({ authenticated: false });
    }

    return res.status(200).json({ authenticated: true, role: session.role });
}
