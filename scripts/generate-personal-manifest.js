import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const personalDir = path.join(__dirname, '../public/images/personal');

// Ensure directory exists
if (!fs.existsSync(personalDir)) {
    fs.mkdirSync(personalDir, { recursive: true });
    console.log(`✅ Created directory: ${personalDir}`);
}

// Get all image and video files
const validExtensions = /\.(jpg|jpeg|png|webp|gif|mp4|webm|mov)$/i;
const files = fs.readdirSync(personalDir)
    .filter(f => {
        const fullPath = path.join(personalDir, f);
        const stat = fs.statSync(fullPath);
        return stat.isFile() && validExtensions.test(f);
    })
    .sort();

// Generate manifest
const manifest = files.map(f => {
    const isVideo = /\.(mp4|webm|mov)$/i.test(f);
    return {
        filename: f,
        type: isVideo ? 'video' : 'image',
        uploaded: new Date().toISOString().split('T')[0],
    };
});

// Write manifest
const manifestPath = path.join(__dirname, '../public/personal-manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

console.log(`✅ Generated manifest with ${manifest.length} item${manifest.length !== 1 ? 's' : ''}`);
if (manifest.length > 0) {
    console.log(`   Files: ${files.slice(0, 3).join(', ')}${files.length > 3 ? ` ... +${files.length - 3} more` : ''}`);
}
