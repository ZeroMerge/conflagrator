import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';
import { listApprovedUploads } from '../_lib/personalUploads';

const readManifestFallback = () => {
    const manifestPath = path.join(process.cwd(), 'public', 'personal-manifest.json');
    if (!fs.existsSync(manifestPath)) return [];

    try {
        const raw = fs.readFileSync(manifestPath, 'utf8');
        const list = JSON.parse(raw);
        if (!Array.isArray(list)) return [];

        return list
            .map((entry: any) => {
                if (typeof entry === 'string') {
                    const normalized = entry.replace(/\\/g, '/');
                    const filename = normalized.split('/').pop() || '';
                    if (!filename) return null;

                    return {
                        publicId: `static:${filename}`,
                        secureUrl: `/images/personal/${encodeURIComponent(filename)}`,
                        resourceType: /\.(mp4|webm|mov)$/i.test(filename) ? 'video' : 'image',
                        format: filename.split('.').pop() || null,
                        bytes: null,
                        folder: 'static',
                        status: 'approved',
                        createdAt: new Date().toISOString(),
                        approvedAt: new Date().toISOString(),
                        approvedBy: 'static-manifest',
                    };
                }

                if (entry && typeof entry.filename === 'string') {
                    const filename = entry.filename;
                    return {
                        publicId: `static:${filename}`,
                        secureUrl: `/images/personal/${encodeURIComponent(filename)}`,
                        resourceType: entry.type || (/\.(mp4|webm|mov)$/i.test(filename) ? 'video' : 'image'),
                        format: filename.split('.').pop() || null,
                        bytes: null,
                        folder: 'static',
                        status: 'approved',
                        createdAt: entry.uploaded || new Date().toISOString(),
                        approvedAt: entry.uploaded || new Date().toISOString(),
                        approvedBy: 'static-manifest',
                    };
                }

                return null;
            })
            .filter(Boolean);
    } catch {
        return [];
    }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    // Always load static manifest items first (never fails)
    const fallbackItems = readManifestFallback();

    let dbItems: any[] = [];
    try {
        dbItems = await listApprovedUploads();
    } catch {
        // Database unavailable — serve static manifest only
        console.warn('[approved] Database unavailable, using static manifest fallback');
        return res.status(200).json({ items: fallbackItems });
    }

    const seen = new Set<string>();
    const merged = [...dbItems, ...fallbackItems].filter((item: any) => {
        const key = item.publicId || item.secureUrl;
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    return res.status(200).json({ items: merged });
}
