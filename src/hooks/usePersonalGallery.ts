import { useState, useEffect } from 'react';

export interface CarouselItem {
    filename: string;
    type: 'image' | 'video';
    src: string;
    uploaded: string;
}

const manifestToItems = (list: any[]): CarouselItem[] =>
    list
        .map((entry: any) => {
            if (typeof entry === 'string') {
                const normalized = entry.replace(/\\/g, '/');
                const filename = normalized.split('/').pop() || '';
                if (!filename) return null;
                return {
                    filename,
                    type: /\.(mp4|webm|mov)$/i.test(filename) ? 'video' : 'image',
                    src: `/images/personal/${encodeURIComponent(filename)}`,
                    uploaded: new Date().toISOString().split('T')[0],
                } as CarouselItem;
            }
            if (entry && typeof entry.filename === 'string') {
                const filename = entry.filename;
                return {
                    filename,
                    type: entry.type || (/\.(mp4|webm|mov)$/i.test(filename) ? 'video' : 'image'),
                    src: `/images/personal/${encodeURIComponent(filename)}`,
                    uploaded: entry.uploaded || new Date().toISOString().split('T')[0],
                } as CarouselItem;
            }
            return null;
        })
        .filter((item: CarouselItem | null): item is CarouselItem => Boolean(item));

const dbRowToItem = (r: any): CarouselItem | null => {
    // DB returns snake_case columns
    const publicId: string = r.public_id ?? r.publicId ?? '';
    const secureUrl: string = r.secure_url ?? r.secureUrl ?? '';
    const resourceType: string = r.resource_type ?? r.resourceType ?? 'image';
    if (!publicId || !secureUrl) return null;
    const filename = publicId.split('/').pop() || publicId;
    return {
        filename,
        type: resourceType === 'video' ? 'video' : 'image',
        src: secureUrl,
        uploaded: r.approved_at ?? r.created_at ?? new Date().toISOString().split('T')[0],
    };
};

export const usePersonalGallery = () => {
    const [items, setItems] = useState<CarouselItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoading(true);

            // ── Step 1: Always load the local manifest (25 public images) ──────────
            let manifestItems: CarouselItem[] = [];
            try {
                const res = await fetch(`/personal-manifest.json?v=${Date.now()}`);
                if (res.ok) {
                    const ct = res.headers.get('content-type') || '';
                    let manifest: any;
                    if (ct.includes('application/json')) {
                        manifest = await res.json();
                    } else {
                        const text = await res.text();
                        try { manifest = JSON.parse(text); } catch { /* ignore */ }
                    }
                    if (Array.isArray(manifest)) {
                        manifestItems = manifestToItems(manifest);
                    }
                }
            } catch {
                // Silent — public images best-effort
            }

            // ── Step 2: Try to fetch DB-approved images and MERGE on top ───────────
            let dbItems: CarouselItem[] = [];
            try {
                const res = await fetch(`/api/personal/approved?v=${Date.now()}`);
                if (res.ok) {
                    const payload = await res.json();
                    const list = Array.isArray(payload?.items) ? payload.items : [];
                    dbItems = list
                        .map(dbRowToItem)
                        .filter((i: CarouselItem | null): i is CarouselItem => i !== null);
                }
            } catch {
                // Silent — DB approved images best-effort
            }

            if (cancelled) return;

            // DB-approved items first (newest), then manifest items that aren't duplicated
            const dbFilenames = new Set(dbItems.map(i => i.filename));
            const deduped = manifestItems.filter(i => !dbFilenames.has(i.filename));
            const merged = [...dbItems, ...deduped];

            setItems(merged);
            setError(null);
            setLoading(false);
        };

        load();
        return () => { cancelled = true; };
    }, []);

    return { items, loading, error };
};
