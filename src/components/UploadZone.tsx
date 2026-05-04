import React, { useEffect, useRef, useState } from 'react';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';

interface UploadZoneProps {
    onUploadSuccess?: (result?: any) => void;
    onUploadMessage?: (message: string) => void;
}

type MediaKind = 'image' | 'video';

interface TransformResult {
    blob: Blob;
    filename: string;
    kind: MediaKind;
}

interface PreviewState {
    url: string;
    name: string;
    kind: MediaKind;
}

// Client-side: read Vite envs when available. Fallback to the folder name you mentioned.
const CLOUDINARY_CLOUD_NAME = (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string) || 'dfc5d6qrg';
const CLOUDINARY_UPLOAD_PRESET = (import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string) || 'OREOLUWA';
const CLOUDINARY_FOLDER = (import.meta.env.VITE_CLOUDINARY_FOLDER as string) || 'OREOLUWA PERSONAL';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

const isVideoFile = (file: File) => VIDEO_TYPES.includes(file.type);

const buildSafeFilename = (fileName: string) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = fileName.split('.').pop() || 'jpg';
    return `upload-${timestamp}-${random}.${ext.toLowerCase()}`;
};

const UploadZone: React.FC<UploadZoneProps> = ({ onUploadSuccess, onUploadMessage }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [preview, setPreview] = useState<PreviewState | null>(null);

    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview.url);
            }
        };
    }, [preview]);

    // Security: Image transformation & sanitization
    const transformImage = async (file: File): Promise<TransformResult> => {
        const maxSizeMB = 10;
        const maxSizeBytes = maxSizeMB * 1024 * 1024;

        // Check file size
        if (file.size > maxSizeBytes) {
            throw new Error(`File size exceeds ${maxSizeMB}MB limit`);
        }

        // Check MIME type
        if (!IMAGE_TYPES.includes(file.type)) {
            throw new Error('Only JPEG, PNG, and WebP images are allowed');
        }

        // Transform image using Canvas to strip EXIF & metadata
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';

                img.onload = () => {
                    try {
                        // Create canvas and redraw (removes EXIF & metadata)
                        const canvas = document.createElement('canvas');
                        const maxDimension = 2400; // Max 2400px for web use

                        let width = img.width;
                        let height = img.height;

                        if (width > height) {
                            if (width > maxDimension) {
                                height = Math.round((height * maxDimension) / width);
                                width = maxDimension;
                            }
                        } else {
                            if (height > maxDimension) {
                                width = Math.round((width * maxDimension) / height);
                                height = maxDimension;
                            }
                        }

                        canvas.width = width;
                        canvas.height = height;

                        const ctx = canvas.getContext('2d');
                        if (!ctx) throw new Error('Failed to get canvas context');

                        ctx.drawImage(img, 0, 0, width, height);

                        // Convert to blob (removes all metadata)
                        canvas.toBlob(
                            (blob) => {
                                if (!blob) throw new Error('Failed to create blob');

                                const safeFilename = buildSafeFilename(file.name);

                                resolve({
                                    blob,
                                    filename: safeFilename,
                                    kind: 'image',
                                });
                            },
                            file.type,
                            0.92 // Quality (removes artifacts while maintaining fidelity)
                        );
                    } catch (err) {
                        reject(err);
                    }
                };

                img.onerror = () => reject(new Error('Failed to process image'));
                img.src = event.target?.result as string;
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    };

    const uploadToCloudinary = async (file: Blob, filename: string, kind: MediaKind) => {
        const resourceType = kind === 'video' ? 'video' : 'image';
        const formData = new FormData();
        formData.append('file', file, filename);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        formData.append('folder', CLOUDINARY_FOLDER);
        formData.append('public_id', filename.replace(/\.[^.]+$/, ''));

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Cloudinary upload failed');
        }

        return response.json();
    };

    const createPreview = (file: Blob | File, kind: MediaKind) => {
        const url = URL.createObjectURL(file);
        const name = file instanceof File ? file.name : kind;
        setPreview({ url, name, kind });
    };

    const handleFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const file = files[0];
        const kind: MediaKind = isVideoFile(file) ? 'video' : 'image';

        try {
            setMessage(null);
            setUploading(true);

            if (!IMAGE_TYPES.includes(file.type) && !VIDEO_TYPES.includes(file.type)) {
                throw new Error('Only JPEG, PNG, WebP, MP4, WebM, and MOV files are allowed');
            }

            if (kind === 'image') {
                const transformed = await transformImage(file);
                createPreview(transformed.blob, transformed.kind);

                const uploadResult = await uploadToCloudinary(transformed.blob, transformed.filename, transformed.kind);
                const successText = `Uploaded ${file.name}. It is awaiting approval.`;

                setMessage({
                    type: 'success',
                    text: `✓ ${successText}`,
                });
                onUploadMessage?.(successText);

                setPreview(null);
                URL.revokeObjectURL(preview?.url || '');
                if (fileInputRef.current) fileInputRef.current.value = '';

                if (onUploadSuccess) {
                    onUploadSuccess(uploadResult);
                }

                return uploadResult;
            }

            const safeFilename = buildSafeFilename(file.name);
            createPreview(file, kind);
            const uploadResult = await uploadToCloudinary(file, safeFilename, kind);
            const successText = `Uploaded ${file.name}. It is awaiting approval.`;

            setMessage({
                type: 'success',
                text: `✓ ${successText}`,
            });
            onUploadMessage?.(successText);

            setPreview(null);
            URL.revokeObjectURL(preview?.url || '');
            if (fileInputRef.current) fileInputRef.current.value = '';

            if (onUploadSuccess) {
                onUploadSuccess(uploadResult);
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Upload failed';
            setMessage({ type: 'error', text: `✗ ${errorMsg}` });
            setPreview(null);
        } finally {
            setUploading(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    };

    return (
        <div className="w-full">
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg p-8 md:p-12 transition-all duration-300 ${isDragging
                    ? 'border-conflagrator-red bg-conflagrator-red/5'
                    : 'border-white/20 bg-white/2 hover:border-white/30'
                    }`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                    onChange={(e) => handleFiles(e.target.files)}
                    className="hidden"
                    disabled={uploading}
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
                                disabled={uploading}
                                className="text-white/20 hover:text-white/40 disabled:opacity-50"
                            >
                                browse
                            </button>
                        </p>
                        <p className="font-dm text-[10px] text-white/30">
                            JPG, PNG, WebP, MP4, WebM, MOV • Up to 10MB • Photos are transformed for security
                        </p>
                    </div>
                </div>

                {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-deep-black/80 rounded-lg backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-2 border-conflagrator-red/30 border-t-conflagrator-red rounded-full animate-spin" />
                            <p className="font-dm text-xs text-white/60">Processing...</p>
                        </div>
                    </div>
                )}
            </div>

            {preview && (
                <div className="mt-6 flex gap-4">
                    <div className="w-24 h-24 rounded overflow-hidden border border-white/10 flex-shrink-0 bg-black">
                        {preview.kind === 'video' ? (
                            <video src={preview.url} className="w-full h-full object-cover" muted playsInline />
                        ) : (
                            <img src={preview.url} alt="" className="w-full h-full object-cover" />
                        )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                        <div>
                            <p className="font-dm font-bold text-sm text-off-white truncate">{preview.name}</p>
                            <p className="font-dm text-xs text-white/50 mt-1">
                                {preview.kind === 'video'
                                    ? 'Video will upload to Cloudinary for approval'
                                    : 'Image will be transformed before upload for security'}
                            </p>
                        </div>
                        <button
                            onClick={() => setPreview(null)}
                            className="text-white/40 hover:text-white/60 text-xs uppercase tracking-widest font-dm self-start"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}

            {message && (
                <div
                    className={`mt-4 flex items-center gap-3 p-4 rounded text-sm font-dm ${message.type === 'success'
                        ? 'bg-teal/10 text-teal border border-teal/30'
                        : 'bg-conflagrator-red/10 text-conflagrator-red border border-conflagrator-red/30'
                        }`}
                >
                    {message.type === 'success' ? (
                        <CheckCircle size={18} className="flex-shrink-0" />
                    ) : (
                        <AlertCircle size={18} className="flex-shrink-0" />
                    )}
                    <p>{message.text}</p>
                </div>
            )}

            <div className="mt-6 pt-6 border-t border-white/10">
                <p className="font-dm text-[10px] uppercase tracking-widest text-white/30 mb-2">Security</p>
                <ul className="space-y-1 text-[10px] text-white/40 font-dm">
                    <li>✓ EXIF data & metadata stripped during transform</li>
                    <li>✓ Images resized to 2400px max (safe web size)</li>
                    <li>✓ Quality optimized to 92% (removes artifacts)</li>
                    <li>✓ Filename randomized (prevents enumeration)</li>
                    <li>✓ Requires admin approval before public display</li>
                    <li>✓ Uploads go through Cloudinary with your preset</li>
                </ul>
            </div>
        </div>
    );
};

export default UploadZone;
