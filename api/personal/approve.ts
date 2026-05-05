import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdminSession } from '../_lib/adminSession';
import { approveUpload } from '../_lib/personalUploads';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const session = requireAdminSession(req, res);
    if (!session) {
        return;
    }

    try {
        const { publicId } = req.body || {};

        if (!publicId) {
            return res.status(400).json({ message: 'publicId is required' });
        }

        const upload = await approveUpload(String(publicId), session.role);

        return res.status(200).json({
            message: 'Approved and published',
            filename: upload.publicId.split('/').pop() || upload.publicId,
            upload,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Approval failed',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}