import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // Get form data
        const { file, type, originalName } = req.body;

        if (!file) {
            return res.status(400).json({ message: 'No file provided' });
        }

        // In production, save to a cloud storage (Cloudinary, AWS S3, etc.)
        // For now, return a pending status

        // Store metadata in a simple JSON file or database
        const timestamp = new Date().toISOString();
        const uploadRecord = {
            originalName,
            uploadedAt: timestamp,
            status: 'pending',
            approvedAt: null,
        };

        // Note: In a real implementation, you would:
        // 1. Save the file to cloud storage
        // 2. Store the upload record in a database
        // 3. Send an email to admin for approval

        return res.status(200).json({
            message: 'Upload received. Awaiting admin approval.',
            status: 'pending',
            ...uploadRecord,
        });
    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({
            message: 'Server error during upload',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
