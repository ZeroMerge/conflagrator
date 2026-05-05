import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

// Read static manifest — always available, never fails
const readManifestFallback = () => {
    try {
        const manifestPath = path.join(process.cwd(), 'public', 'personal-manifest.json');
        if (!fs.existsSync(manifestPath)) return [];

        const raw = fs.readFileSync(manifestPath, 'utf8');
        const list = JSON.parse(raw);
        if (!Array.isArray(list)) return [];

        return list
            .map((entry: any) => {
                if (typeof entry === 'string') {
                    const filename = entry.replace(/\\/g, '/').split('/').pop() || '';
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

// Lazy DB query — only runs if DATABASE_URL is available
const fetchDbApproved = async () => {
    const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL;
    if (!dbUrl) return [];

    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(dbUrl);
    const rows = await sql(
        `SELECT * FROM personal_uploads WHERE status = 'approved' ORDER BY approved_at DESC NULLS LAST, created_at DESC;`
    );

    return rows.map((row: any) => ({
        publicId: row.public_id,
        secureUrl: row.secure_url,
        resourceType: row.resource_type,
        format: row.format,
        bytes: row.bytes == null ? null : Number(row.bytes),
        folder: row.folder,
        status: row.status,
        createdAt: row.created_at,
        approvedAt: row.approved_at,
        approvedBy: row.approved_by,
    }));
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    // Static manifest always loads first — never fails
    const fallbackItems = readManifestFallback();

    let dbItems: any[] = [];
    try {
        dbItems = await fetchDbApproved();
    } catch (err) {
        console.warn('[approved] DB fetch failed, using static fallback:', err);
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
