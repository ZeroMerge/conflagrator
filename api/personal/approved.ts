import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

// Static file fallback — reads from public/personal-manifest.json
const readStaticFallback = (): any[] => {
    try {
        const p = path.join(process.cwd(), 'public', 'personal-manifest.json');
        if (!fs.existsSync(p)) return [];
        const list = JSON.parse(fs.readFileSync(p, 'utf8'));
        if (!Array.isArray(list)) return [];
        return list
            .map((entry: any) => {
                const filename =
                    typeof entry === 'string'
                        ? (entry.replace(/\\/g, '/').split('/').pop() || '')
                        : (entry?.filename || '');
                if (!filename) return null;
                return {
                    publicId: `static:${filename}`,
                    secureUrl: `/images/personal/${encodeURIComponent(filename)}`,
                    resourceType: /\.(mp4|webm|mov)$/i.test(filename) ? 'video' : 'image',
                    format: filename.split('.').pop() || null,
                    bytes: null, folder: 'static', status: 'approved',
                    createdAt: entry?.uploaded || new Date().toISOString(),
                    approvedAt: entry?.uploaded || new Date().toISOString(),
                    approvedBy: 'static-manifest',
                };
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

    const staticItems = readStaticFallback();
    const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL;

    if (!dbUrl) {
        // No DB configured — just return static photos
        return res.status(200).json({ items: staticItems });
    }

    try {
        const sql = neon(dbUrl);
        const dbRows = await sql(
            `SELECT id, public_id, secure_url, resource_type, format, bytes, folder, status,
                    created_at, approved_at, approved_by
             FROM personal_uploads WHERE status = 'approved' ORDER BY approved_at DESC`
        );

        // Merge DB rows + static, deduplicated
        const seen = new Set<string>();
        const merged = [...(dbRows as any[]), ...staticItems].filter((item: any) => {
            const key = item.publicId || item.public_id || item.secureUrl || item.secure_url;
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        return res.status(200).json({ items: merged });
    } catch (err: any) {
        console.warn('[approved] DB failed, returning static only:', err?.message);
        return res.status(200).json({ items: staticItems });
    }
}
