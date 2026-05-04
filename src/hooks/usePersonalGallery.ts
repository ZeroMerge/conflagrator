import { useState, useEffect } from 'react';

export interface CarouselItem {
    filename: string;
    type: 'image' | 'video';
    src: string;
    uploaded: string;
}

export const usePersonalGallery = () => {
    const [items, setItems] = useState<CarouselItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchManifest = async () => {
            try {
                const res = await fetch(`/personal-manifest.json?v=${Date.now()}`);
                if (!res.ok) throw new Error('Failed to fetch manifest');

                const manifest = await res.json();
                const list = Array.isArray(manifest) ? manifest : [];

                const transformed: CarouselItem[] = list
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

                setItems(transformed);
                setError(null);
            } catch (err) {
                console.error('Gallery fetch error:', err);
                setError(err instanceof Error ? err.message : 'Failed to load gallery');
                setItems([]);
            } finally {
                setLoading(false);
            }
        };

        fetchManifest();
    }, []);

    return { items, loading, error };
};
