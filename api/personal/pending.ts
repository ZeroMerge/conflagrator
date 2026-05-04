import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdminSession } from '../_lib/adminSession';

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dfc5d6qrg';
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
// Server-side folder; allow override via env. Default to the folder you indicated.
const PENDING_FOLDER = process.env.CLOUDINARY_FOLDER || 'OREOLUWA PERSONAL';

const getAuthHeader = () => {
    if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
        throw new Error('Missing CLOUDINARY_API_KEY or CLOUDINARY_API_SECRET');
    }
    return `Basic ${Buffer.from(`${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}`).toString('base64')}`;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const session = requireAdminSession(req, res);
    if (!session) {
        return;
    }

    try {
        const authHeader = getAuthHeader();
        const expression = `folder=\"${PENDING_FOLDER}\"`;

        const cloudinaryRes = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/resources/search`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: authHeader,
                },
                body: JSON.stringify({
                    expression,
                    sort_by: [{ uploaded_at: 'desc' }],
                    max_results: 100,
                }),
            }
        );

        if (!cloudinaryRes.ok) {
            const body = await cloudinaryRes.text();
            return res.status(502).json({ message: body || 'Failed to fetch Cloudinary resources' });
        }

        const data = await cloudinaryRes.json();
        const items = Array.isArray(data.resources)
            ? data.resources.map((entry: any) => ({
                publicId: entry.public_id,
                secureUrl: entry.secure_url,
                resourceType: entry.resource_type,
                format: entry.format,
                bytes: entry.bytes,
                createdAt: entry.created_at,
            }))
            : [];

        return res.status(200).json({ items });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to load pending uploads',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}