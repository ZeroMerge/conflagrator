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
export const uploadToCloudinary = (blob: Blob, filename: string, kind: MediaKind, onProgress?: (progress: number) => void): Promise<any> => {
    return new Promise((resolve, reject) => {
        const resourceType = kind === 'video' ? 'video' : 'image';
        const fd = new FormData();
        fd.append('file', blob, filename);
        fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        fd.append('folder', CLOUDINARY_FOLDER);
        fd.append('public_id', filename.replace(/\.[^.]+$/, ''));

        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`);

        if (onProgress) {
            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    const percent = Math.round((e.loaded / e.total) * 100);
                    onProgress(percent);
                }
            };
        }

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    resolve(response);
                } catch (err) {
                    reject(new Error('Invalid JSON response from Cloudinary'));
                }
            } else {
                reject(new Error(xhr.responseText || 'Cloudinary upload failed'));
            }
        };

        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.send(fd);
    });
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
        <div className="w-full font-dm">
            <div
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
                onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }}
                onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
                className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-10 md:p-16 transition-all duration-500 ease-out cursor-pointer overflow-hidden ${
                    isDragging 
                        ? 'border-conflagrator-red bg-conflagrator-red/10 scale-[1.02] shadow-[0_0_30px_rgba(227,0,15,0.15)]' 
                        : 'border-white/10 bg-white/[0.01] hover:border-white/20 hover:bg-white/[0.03]'
                }`}
                onClick={() => !processing && fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                    onChange={(e) => handleFiles(e.target.files)}
                    className="hidden"
                    disabled={processing}
                />

                <div className="flex flex-col items-center gap-5 relative z-10">
                    <div className="p-4 rounded-full bg-white/[0.03] border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.02)]">
                        <Upload size={32} className="text-white/60" strokeWidth={1.5} />
                    </div>
                    
                    <div className="text-center space-y-2">
                        <h3 className="font-dm font-semibold text-lg md:text-xl text-off-white tracking-tight">
                            Share <span className="text-conflagrator-red">(quietly)</span>
                        </h3>
                        <p className="font-dm text-xs md:text-sm text-white/50">
                            Drag & drop, or{' '}
                            <span className="text-white/80 underline decoration-white/30 underline-offset-4 hover:text-white hover:decoration-white transition-colors">
                                browse your device
                            </span>
                        </p>
                    </div>

                    <div className="mt-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/5">
                        <p className="font-dm text-[10px] md:text-xs tracking-wide text-white/30 uppercase">
                            JPG, PNG, WebP, MP4, MOV • Up to 10MB
                        </p>
                    </div>
                </div>

                {processing && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-deep-black/90 backdrop-blur-md rounded-2xl">
                        <div className="w-10 h-10 border-2 border-white/10 border-t-conflagrator-red rounded-full animate-spin mb-4" />
                        <p className="font-dm text-sm tracking-widest text-white/60 uppercase">Processing Media...</p>
                    </div>
                )}
            </div>

            {error && (
                <div className="mt-5 flex items-start gap-3 p-4 rounded-lg bg-conflagrator-red/5 border border-conflagrator-red/20 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle size={18} className="text-conflagrator-red shrink-0 mt-0.5" />
                    <p className="text-sm font-dm text-white/80 leading-relaxed">{error}</p>
                </div>
            )}

            <div className="mt-8 pt-8 border-t border-white/5">
                <p className="font-dm text-[11px] font-bold uppercase tracking-[0.2em] text-white/20 mb-4">
                    Security & Privacy Protocol
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                    {[
                        'EXIF data & metadata automatically stripped',
                        'Images resized to 2400px max (safe web size)',
                        'Filename randomized to prevent enumeration',
                        'Upload only happens after explicit consent',
                        'Requires admin approval before public display'
                    ].map((item, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-conflagrator-red/80 shrink-0" />
                            <span className="text-[11px] md:text-xs text-white/40 leading-relaxed tracking-wide">
                                {item}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UploadZone;
