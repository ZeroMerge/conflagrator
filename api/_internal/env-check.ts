import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        res.status(405).json({ ok: false, message: 'Method not allowed' });
        return;
    }

    const cloudName = !!process.env.CLOUDINARY_CLOUD_NAME;
    const hasKey = !!process.env.CLOUDINARY_API_KEY;
    const hasSecret = !!process.env.CLOUDINARY_API_SECRET;
    const uploadPreset = !!process.env.CLOUDINARY_UPLOAD_PRESET;
    const folder = process.env.CLOUDINARY_FOLDER || null;
    const hasPostgres = !!(process.env.POSTGRES_URL || process.env.VERCEL_POSTGRES_URL || process.env.POSTGRES_PRISMA_URL);

    res.status(200).json({
        ok: true,
        cloudinary: {
            cloudName,
            hasKey,
            hasSecret,
            uploadPreset,
            folder,
        },
        postgres: {
            configured: hasPostgres,
        },
    });
}
