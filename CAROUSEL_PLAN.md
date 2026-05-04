# Image & Video Carousel with Upload - Implementation Plan

## Overview
Add a dynamic carousel section between **ChapterOrigins** and **ChapterAuthor** that displays images/videos from `/public/images/personal/`, with:
- ✅ **Auto-parsing** (no hardcoded list)
- ✅ **User uploads** with admin approval workflow
- ✅ **Responsive** carousel layout
- ✅ **Lazy loading** for performance

---

## 1. Architecture Overview

### Frontend
```
Home.tsx
├── ChapterOrigins (existing)
├── ChapterPersonal (NEW) ← Carousel component
│   ├── StaticCarousel (displays approved images from /public/images/personal/)
│   ├── UploadZone (drag-drop upload UI)
│   └── PendingGallery (shows user's pending uploads preview)
└── ChapterAuthor (existing)
```

### Backend (Simple File-based)
```
public/images/personal/
├── approved/ ← Symlink or folder with only approved images
├── pending/ ← Uploads waiting for approval (not served to frontend)
└── .metadata.json ← Maps files to upload dates/approvals
```

### Alternative: Database Approach
```
supabase/
├── storage → personal_uploads bucket
└── database → uploads table (status, filename, uploader_email, timestamp)
```

---

## 2. Component Structure

### A. `src/components/PersonalCarousel.tsx` (NEW)
**Purpose**: Display approved images/videos with auto-discovery

**Features**:
- Fetches `/public/images/personal/approved/` manifest
- Displays images in horizontal scroll carousel
- Next/Prev buttons (like Bicycle section)
- Touch-swipe support
- Lazy loading images
- Video preview support

**Props**: None (self-contained)

**State Management**:
```tsx
const [items, setItems] = useState<CarouselItem[]>([]);
const [loading, setLoading] = useState(true);
const [activeIndex, setActiveIndex] = useState(0);
```

### B. `src/components/UploadZone.tsx` (NEW)
**Purpose**: Accept user photo uploads

**Features**:
- Drag-drop zone
- File input fallback
- Image preview before upload
- Submit button → sends to backend
- Success/error feedback

**Props**:
```tsx
interface UploadZoneProps {
  onUploadStart?: () => void;
  onUploadSuccess?: (filename: string) => void;
  onUploadError?: (error: string) => void;
}
```

### C. `src/hooks/usePersonalGallery.ts` (NEW)
**Purpose**: Fetch and manage carousel items

**Functions**:
- `getApprovedItems()` → fetch manifest from `/api/personal/approved`
- `uploadFile(file: File)` → POST to `/api/personal/upload`
- `getPendingUploads()` → check user's pending uploads (localStorage-based initially)

---

## 3. Data Flow

### Getting Images (Frontend → Public Folder)

**Step 1: Generate manifest at build-time**
```bash
# During npm run build:
# Script scans /public/images/personal/ folder
# Outputs: public/personal-manifest.json
[
  { "filename": "photo-001.jpg", "type": "image", "uploaded": "2025-01-15" },
  { "filename": "video-002.mp4", "type": "video", "uploaded": "2025-01-20" }
]
```

**Step 2: Fetch on component mount**
```tsx
fetch('/personal-manifest.json')
  .then(res => res.json())
  .then(items => setItems(items))
```

### Uploading Photos (User → Backend → Approval)

**Step 1: User uploads via UI**
```
Upload form → FormData(file) → POST /api/personal/upload
```

**Step 2: Server processing**
```
/api/personal/upload
├── Validate file (size, type: jpg/png/webp/mp4)
├── Save to /uploads/pending/{timestamp}-{filename}
├── Send admin email notification
└── Return { id, status: 'pending', message: 'Awaiting approval' }
```

**Step 3: Admin approves (Backend CLI or simple admin page)**
```bash
# Or via admin dashboard:
mv /uploads/pending/{file} /public/images/personal/{file}
Update personal-manifest.json
Rebuild & redeploy
```

**Step 4: User sees photo in carousel**
```
New manifest.json → Component refetches → Photo appears
```

---

## 4. File Structure

```
src/
├── components/
│   ├── PersonalCarousel.tsx (NEW)
│   ├── UploadZone.tsx (NEW)
│   └── ...existing
├── hooks/
│   ├── usePersonalGallery.ts (NEW)
│   └── ...existing
├── pages/
│   ├── Home.tsx (MODIFY - add ChapterPersonal component)
│   └── ...existing

public/
├── images/
│   ├── personal/
│   │   ├── photo-1.jpg
│   │   ├── photo-2.jpg
│   │   ├── video-1.mp4
│   │   └── ... (grows dynamically)
│   └── ...existing
├── personal-manifest.json (NEW - auto-generated at build)
└── ...existing

api/ (backend endpoints)
├── personal/
│   ├── upload.ts (handles POST requests)
│   └── approved.ts (serves manifest)
└── ...existing
```

---

## 5. Implementation Steps

### Phase 1: Static Carousel (No uploads yet)
**Effort**: ~2 hours

1. **Create `PersonalCarousel.tsx`**
   - Hardcode manifest first
   - Build carousel UI (use existing Bicycle section as reference)
   - Add next/prev navigation
   - Responsive grid on mobile

2. **Create `usePersonalGallery.ts` hook**
   - `fetchManifest()` function
   - `getCarouselItems()` returns normalized data

3. **Integrate into Home.tsx**
   - Add `ChapterPersonal` component between Origins and Author
   - Use `ScrollReveal` for animations
   - Add section title: "MOMENTS THAT BUILD"

4. **Styling**
   - Match existing design (deep-black, conflagrator-red accents)
   - Use Tailwind for responsive
   - Add hover effects (scale, grayscale remove)

### Phase 2: Upload Functionality
**Effort**: ~3-4 hours

1. **Create `UploadZone.tsx` component**
   - Drag-drop zone
   - File preview
   - Submit button
   - Loading state

2. **Backend API `/api/personal/upload`**
   - Handle multipart form-data
   - Validate file type/size (max 10MB, jpg/png/webp/mp4)
   - Save to temporary pending folder
   - Send admin email notification
   - Return success/error to frontend

3. **Local storage tracking** (initial approach)
   - Store upload history in browser localStorage
   - Show "Pending Approval" badge on user's uploads
   - Allow retry if upload fails

4. **Add to Home page**
   - Place upload zone below carousel
   - Hide behind "toggle" or in a collapsible section
   - Show success message when upload completes

### Phase 3: Admin Approval Workflow
**Effort**: ~2-3 hours

1. **Create `/pages/Admin.tsx` (or simple CLI script)**
   - List pending uploads
   - Preview image/video
   - Approve/reject buttons
   - When approved: move file → manifest updates → rebuild

2. **Auto-rebuild trigger**
   - Webhook on approval
   - Or manual "Publish" button that runs build script

3. **Email notification to uploader**
   - On approval: "Your photo is now live!"
   - On rejection: "Image didn't meet guidelines, please try again"

---

## 6. Technical Considerations

### Dynamic File Discovery
**Problem**: How to avoid hardcoding the list?

**Solution A (Simple, Recommended)**
- Build-time script scans `/public/images/personal/`
- Generates `personal-manifest.json`
- Deploy manifest with app
- ✅ No runtime overhead, deterministic builds
- ❌ Requires rebuild after approval

**Solution B (Dynamic, Requires Backend)**
- API endpoint `/api/personal/list` reads directory at runtime
- Returns list of approved files
- ✅ No rebuild needed
- ❌ Needs server (Vercel serverless function or Node backend)

### Performance Optimization
```tsx
// Lazy load images
<img 
  src={item.src} 
  loading="lazy" 
  alt={item.alt}
/>

// Only load visible carousel items
const [visibleRange, setVisibleRange] = useState([0, 5]);
```

### File Upload Security
```
✅ Whitelist file types: jpg, jpeg, png, webp, mp4
✅ Max file size: 10MB
✅ Scan for malware (if backend available)
✅ Save to server with random filename (prevent overwrites)
✅ Require approval before serving
```

### Mobile Responsiveness
```
- Mobile: 1 column (vertical scroll)
- Tablet: 2 columns
- Desktop: 3-4 columns horizontal scroll
- Touch: swipe gestures for carousel
```

---

## 7. Code Examples

### `usePersonalGallery.ts`
```typescript
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
        const res = await fetch('/personal-manifest.json');
        const manifest = await res.json();
        const transformed = manifest.map((m: any) => ({
          ...m,
          src: `/images/personal/${m.filename}`,
        }));
        setItems(transformed);
      } catch (err) {
        setError('Failed to load gallery');
      } finally {
        setLoading(false);
      }
    };
    
    fetchManifest();
  }, []);

  return { items, loading, error };
};
```

### `PersonalCarousel.tsx` (Structure)
```typescript
const PersonalCarousel: React.FC = () => {
  const { items, loading } = usePersonalGallery();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scroll = (dir: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' });
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <section className="py-24 md:py-40 bg-deep-black overflow-hidden">
      <div className="px-6 md:px-24 max-w-7xl mx-auto mb-16">
        <ScrollReveal>
          <h2 className="font-dm font-black text-6xl md:text-8xl text-off-white">
            MOMENTS THAT<br /><span className="text-conflagrator-red">BUILD.</span>
          </h2>
        </ScrollReveal>
      </div>

      {/* Carousel */}
      <div className="overflow-x-auto no-scrollbar" ref={scrollRef}>
        <div className="flex gap-6 px-6 md:px-24 pb-8 w-max">
          {items.map((item, i) => (
            <CarouselCard key={i} item={item} />
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="px-6 md:px-24 flex gap-4">
        <button onClick={() => scroll(-1)} className="...">← Prev</button>
        <button onClick={() => scroll(1)} className="...">Next →</button>
      </div>

      {/* Upload Zone */}
      <div className="px-6 md:px-24 max-w-2xl mx-auto mt-20">
        <UploadZone />
      </div>
    </section>
  );
};
```

---

## 8. Deployment Strategy

### Build Script (in `package.json`)
```json
{
  "scripts": {
    "build": "vite build && npm run generate-manifest",
    "generate-manifest": "node scripts/generate-personal-manifest.js"
  }
}
```

### `scripts/generate-personal-manifest.js`
```javascript
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../public/images/personal');
const files = fs.readdirSync(dir).filter(f => 
  /\.(jpg|jpeg|png|webp|mp4)$/i.test(f)
);

const manifest = files.map(f => ({
  filename: f,
  type: f.endsWith('.mp4') ? 'video' : 'image',
  uploaded: new Date().toISOString().split('T')[0],
}));

fs.writeFileSync(
  path.join(__dirname, '../public/personal-manifest.json'),
  JSON.stringify(manifest, null, 2)
);

console.log(`✅ Generated manifest with ${files.length} items`);
```

---

## 9. Timeline & Effort

| Phase | Tasks | Effort | Priority |
|-------|-------|--------|----------|
| **Phase 1** | Static carousel + manifest | 2h | 🔴 High |
| **Phase 2** | Upload UI + backend | 3-4h | 🟡 Medium |
| **Phase 3** | Admin approval workflow | 2-3h | 🟡 Medium |
| **Polish** | Animations, mobile, edge cases | 1-2h | 🟢 Low |

**Total: ~8-12 hours**

---

## 10. Success Criteria

- ✅ Carousel displays all images from `/public/images/personal/` automatically
- ✅ Users can upload photos via drag-drop UI
- ✅ Uploads go to pending folder (not shown to public)
- ✅ Admin can approve/reject (manifest updates)
- ✅ Approved photos appear in carousel within seconds
- ✅ Responsive on mobile/tablet/desktop
- ✅ Matches design system (colors, typography, animations)
- ✅ No console errors, lazy loading works

---

## Questions for Clarification

1. **Backend preference**: Use Vercel serverless (simple) or Node.js backend?
2. **Admin interface**: Simple CLI, or web dashboard?
3. **Email notifications**: Send to admin + uploader?
4. **Video handling**: Just previews or embedded playable?
5. **Approval speed**: Instant auto-approve (moderation) or manual review?
