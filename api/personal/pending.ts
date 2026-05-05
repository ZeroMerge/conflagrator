import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdminSession } from '../_lib/adminSession';
import { listPendingUploads } from '../_lib/personalUploads';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const session = requireAdminSession(req, res);
    if (!session) {
        return;
    }

    try {
        const items = await listPendingUploads();
        return res.status(200).json({ items });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to load pending uploads',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}