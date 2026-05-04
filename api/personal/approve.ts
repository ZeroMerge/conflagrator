import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';
import { requireAdminSession } from '../_lib/adminSession';

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dfc5d6qrg';
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

const validExtensions = /\.(jpg|jpeg|png|webp|gif|mp4|webm|mov)$/i;

const getAuthHeader = () => {
    if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
        throw new Error('Missing CLOUDINARY_API_KEY or CLOUDINARY_API_SECRET');
    }
    return `Basic ${Buffer.from(`${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}`).toString('base64')}`;
};

const ensureUniqueFilename = (dirPath: string, filename: string) => {
    const ext = path.extname(filename);
    const stem = path.basename(filename, ext);
    let candidate = filename;
    let counter = 1;

    while (fs.existsSync(path.join(dirPath, candidate))) {
        candidate = `${stem}-${counter}${ext}`;
        counter += 1;
    }

    return candidate;
};

const generateManifest = (rootDir: string) => {
    const personalDir = path.join(rootDir, 'public', 'images', 'personal');
    if (!fs.existsSync(personalDir)) {
        fs.mkdirSync(personalDir, { recursive: true });
    }

    const files = fs
        .readdirSync(personalDir)
        .filter(file => {
            const full = path.join(personalDir, file);
            const stat = fs.statSync(full);
            return stat.isFile() && validExtensions.test(file);
        })
        .sort();

    const manifest = files.map(file => ({
        filename: file,
        type: /\.(mp4|webm|mov)$/i.test(file) ? 'video' : 'image',
        uploaded: new Date().toISOString().split('T')[0],
    }));

    const manifestPath = path.join(rootDir, 'public', 'personal-manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    return manifest;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const session = requireAdminSession(req, res);
    if (!session) {
        return;
    }

    try {
        const { publicId, secureUrl, resourceType, format } = req.body || {};

        if (!publicId || !secureUrl || !resourceType) {
            return res.status(400).json({ message: 'publicId, secureUrl, and resourceType are required' });
        }

        const rootDir = process.cwd();
        const targetDir = path.join(rootDir, 'public', 'images', 'personal');
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        const rawName = String(publicId).split('/').pop() || `approved-${Date.now()}`;
        const extFromFormat = format ? `.${String(format).toLowerCase()}` : '';
        const extFromUrl = path.extname(new URL(String(secureUrl)).pathname);
        const extension = extFromFormat || extFromUrl || '.jpg';
        const normalizedExt = extension.startsWith('.') ? extension : `.${extension}`;
        const cleanName = rawName.replace(/\.[^.]+$/, '');
        const safeBaseName = `${cleanName}${normalizedExt}`.replace(/[^a-zA-Z0-9._-]/g, '-');
        const filename = ensureUniqueFilename(targetDir, safeBaseName);
        const fullTargetPath = path.join(targetDir, filename);

        const mediaRes = await fetch(String(secureUrl));
        if (!mediaRes.ok) {
            return res.status(502).json({ message: 'Failed to download Cloudinary asset' });
        }

        const bytes = Buffer.from(await mediaRes.arrayBuffer());
        fs.writeFileSync(fullTargetPath, bytes);

        generateManifest(rootDir);

        try {
            const authHeader = getAuthHeader();
            await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/resources/${resourceType}/upload?public_ids[]=${encodeURIComponent(
                    String(publicId)
                )}`,
                {
                    method: 'DELETE',
                    headers: { Authorization: authHeader },
                }
            );
        } catch {
            // non-blocking cleanup
        }

        return res.status(200).json({
            message: 'Approved and published',
            filename,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Approval failed',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}