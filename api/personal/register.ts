import type { VercelRequest, VercelResponse } from '@vercel/node';
import { upsertPendingUpload } from '../_lib/personalUploads';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { publicId, secureUrl, resourceType, format, bytes, folder } = req.body || {};

        if (!publicId || !secureUrl || !resourceType) {
            return res.status(400).json({ message: 'publicId, secureUrl, and resourceType are required' });
        }

        const upload = await upsertPendingUpload({
            publicId: String(publicId),
            secureUrl: String(secureUrl),
            resourceType: resourceType === 'video' ? 'video' : 'image',
            format: format ? String(format) : null,
            bytes: bytes == null ? null : Number(bytes),
            folder: folder ? String(folder) : null,
        });

        return res.status(200).json({
            message: 'Upload registered for review',
            upload,
        });
    } catch (error: any) {
        console.error('[register] error:', error?.message ?? error);
        return res.status(500).json({
            message: 'Failed to register upload',
            error: error?.message ?? 'Unknown error',
        });
    }
}
