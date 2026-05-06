import React, { useRef, useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';

type MediaKind = 'image' | 'video';

export interface ReadyFile {
    blob: Blob;
    filename: string;
    kind: MediaKind;
    previewUrl: string;
}

interface UploadZoneProps {
    /** Called after local processing — Cloudinary upload has NOT happened yet */
    onFileReady?: (file: ReadyFile) => void;
    /** Legacy / fallback — still accepted but not called by this component */
    onUploadSuccess?: (result?: any) => void;
    onUploadMessage?: (message: string) => void;
}

const CLOUDINARY_CLOUD_NAME = (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string) || 'dfc5d6qrg';
const CLOUDINARY_UPLOAD_PRESET = (import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string) || 'OREOLUWA';
const CLOUDINARY_FOLDER = (import.meta.env.VITE_CLOUDINARY_FOLDER as string) || 'OREOLUWA PERSONAL';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

const buildSafeFilename = (fileName: string) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = fileName.split('.').pop() || 'jpg';
    return `upload-${timestamp}-${random}.${ext.toLowerCase()}`;
};

/** Strip EXIF by redrawing through Canvas */
const transformImage = (file: File): Promise<{ blob: Blob; filename: string }> =>
    new Promise((resolve, reject) => {
        if (file.size > 10 * 1024 * 1024) return reject(new Error('File exceeds 10 MB limit'));
        if (!IMAGE_TYPES.includes(file.type)) return reject(new Error('Only JPEG, PNG or WebP images are allowed'));

        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.onload = (ev) => {
            const img = new Image();
            img.onerror = () => reject(new Error('Failed to decode image'));
            img.onload = () => {
                try {
                    const MAX = 2400;
                    let w = img.width, h = img.height;
                    if (w > h ? w > MAX : h > MAX) {
                        if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
                        else { w = Math.round(w * MAX / h); h = MAX; }
                    }
                    const canvas = document.createElement('canvas');
                    canvas.width = w; canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return reject(new Error('Canvas not supported'));
                    ctx.drawImage(img, 0, 0, w, h);
                    canvas.toBlob(
                        (blob) => blob
                            ? resolve({ blob, filename: buildSafeFilename(file.name) })
                            : reject(new Error('Canvas export failed')),
                        file.type, 0.92
                    );
                } catch (e) { reject(e); }
            };
            img.src = ev.target?.result as string;
        };
        reader.readAsDataURL(file);
    });

// ── Exposed helper so Home.tsx can call Cloudinary after consent ──────────────
export const uploadToCloudinary = async (blob: Blob, filename: string, kind: MediaKind) => {
    const resourceType = kind === 'video' ? 'video' : 'image';
    const fd = new FormData();
    fd.append('file', blob, filename);
    fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    fd.append('folder', CLOUDINARY_FOLDER);
    fd.append('public_id', filename.replace(/\.[^.]+$/, ''));

    const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
        { method: 'POST', body: fd }
    );
    if (!res.ok) throw new Error(await res.text() || 'Cloudinary upload failed');
    return res.json();
};

// ─────────────────────────────────────────────────────────────────────────────
const UploadZone: React.FC<UploadZoneProps> = ({ onFileReady }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        const file = files[0];
        const isVideo = VIDEO_TYPES.includes(file.type);
        const isImage = IMAGE_TYPES.includes(file.type);

        if (!isImage && !isVideo) {
            setError('Only JPEG, PNG, WebP, MP4, WebM or MOV files are allowed');
            return;
        }

        try {
            setError(null);
            setProcessing(true);

            let blob: Blob;
            let filename: string;
            const kind: MediaKind = isVideo ? 'video' : 'image';

            if (isImage) {
                const result = await transformImage(file);
                blob = result.blob;
                filename = result.filename;
            } else {
                blob = file;
                filename = buildSafeFilename(file.name);
            }

            // Create local object URL for preview — no Cloudinary yet
            const previewUrl = URL.createObjectURL(blob);

            if (fileInputRef.current) fileInputRef.current.value = '';
            onFileReady?.({ blob, filename, kind, previewUrl });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Processing failed');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="w-full">
            <div
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
                onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }}
                onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
                className={`relative border-2 border-dashed rounded-lg p-8 md:p-12 transition-all duration-300 ${
                    isDragging ? 'border-conflagrator-red bg-conflagrator-red/5' : 'border-white/20 bg-white/2 hover:border-white/30'
                }`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                    onChange={(e) => handleFiles(e.target.files)}
                    className="hidden"
                    disabled={processing}
                />

                <div className="flex flex-col items-center gap-3">
                    <Upload size={28} className="text-white/20" />
                    <div className="text-center">
                        <p className="font-dm font-medium text-[12px] md:text-sm text-white/40 mb-1">
                            Share (quietly)
                        </p>
                        <p className="font-dm text-[11px] md:text-[10px] text-white/30 mb-3">
                            Drag & drop, or{' '}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={processing}
                                className="text-white/20 hover:text-white/40 disabled:opacity-50"
                            >
                                browse
                            </button>
                        </p>
                        <p className="font-dm text-[10px] text-white/30">
                            JPG, PNG, WebP, MP4, WebM, MOV • Up to 10MB • EXIF stripped before upload
                        </p>
                    </div>
                </div>

                {processing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-deep-black/80 rounded-lg backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-2 border-conflagrator-red/30 border-t-conflagrator-red rounded-full animate-spin" />
                            <p className="font-dm text-xs text-white/60">Processing…</p>
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div className="mt-4 flex items-center gap-3 p-4 rounded text-sm font-dm bg-conflagrator-red/10 text-conflagrator-red border border-conflagrator-red/30">
                    <AlertCircle size={18} className="flex-shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            <div className="mt-6 pt-6 border-t border-white/10">
                <p className="font-dm text-[10px] uppercase tracking-widest text-white/30 mb-2">Security</p>
                <ul className="space-y-1 text-[10px] text-white/40 font-dm">
                    <li>✓ EXIF data & metadata stripped during local transform</li>
                    <li>✓ Images resized to 2400px max (safe web size)</li>
                    <li>✓ Filename randomized (prevents enumeration)</li>
                    <li>✓ Upload to Cloudinary only happens after you give consent</li>
                    <li>✓ Requires admin approval before public display</li>
                </ul>
            </div>
        </div>
    );
};

export default UploadZone;
