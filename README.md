# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## Deployment (GitHub + Vercel + Neon Database)

This guide walks you through deploying the app to Vercel with Neon Postgres for the admin upload moderation queue.

**Note:** Vercel Postgres is deprecated. We now use **Neon**, the official replacement. Neon is more reliable and supports HTTP connections for serverless functions.

### Step 1: Push your code to GitHub

1. Create a new repository on GitHub (e.g., `oreoluwa-site`).
2. In your local project root:

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

### Step 2: Create a Neon Postgres Database

1. Go to [console.neon.tech](https://console.neon.tech) and sign up (free tier available).
2. Click **"Create a new project"** or use an existing one.
3. In the **"Connection string"** section, copy the **PostgreSQL connection string** (looks like `postgresql://user:password@host/dbname`).
4. Keep this connection string safe — you'll need it in the next step.

### Step 3: Create a Vercel Project

1. Go to [vercel.com](https://vercel.com) and sign in.
2. Click **"Add New..." → "Project"**.
3. Import your GitHub repo (`oreoluwa-site`).
4. Click **"Import"** and continue with default settings.

### Step 4: Configure Environment Variables

In the Vercel project settings:

1. Go to **"Settings" → "Environment Variables"**.
2. Add the following variables:

   **Database URL (from Neon):**
   - `DATABASE_URL` — paste the PostgreSQL connection string from Step 2 (starts with `postgresql://`)

   **Cloudinary Vars (get from Cloudinary dashboard):**
   - `CLOUDINARY_CLOUD_NAME` — your Cloudinary cloud name
   - `CLOUDINARY_UPLOAD_PRESET` — your unsigned upload preset
   - `CLOUDINARY_FOLDER` — optional, default: `OREOLUWA PERSONAL`
   - `CLOUDINARY_API_KEY` — Cloudinary Account Settings (server only)
   - `CLOUDINARY_API_SECRET` — Cloudinary Account Settings (server only)

   **Auth Vars:**
   - `ADMIN_PASSWORD` — strong password for admin login (e.g., `MyStrongPassword123!`)
   - `SESSION_SECRET` — random string (generate with `openssl rand -hex 32`)

   **Mark as "Server Only":**
   - `DATABASE_URL`
   - All Cloudinary vars except `CLOUDINARY_UPLOAD_PRESET`
   - `ADMIN_PASSWORD`
   - `SESSION_SECRET`

### Step 5: Run the Database Schema

The app needs a `personal_uploads` table. Use Neon's SQL editor:

1. Go to [console.neon.tech](https://console.neon.tech) and select your project.
2. Click **"SQL Editor"** in the sidebar.
3. Open the file [database/personal_uploads.sql](database/personal_uploads.sql) in your editor.
4. Copy the entire SQL content and paste it into Neon's SQL editor.
5. Click **"Execute"** to create the table.

**Alternative: Use psql (local)**

If you have `psql` installed:

```bash
psql "your-neon-connection-string" -f database/personal_uploads.sql
```

### Step 6: Deploy to Vercel

1. **Automatic deployment** (recommended):
   - Push changes to GitHub:
     ```bash
     git add .
     git commit -m "Configure Neon database"
     git push
     ```
   - Vercel auto-deploys. Watch **"Deployments"** tab.

2. **Manual deployment**:
   - In Vercel dashboard, go to **"Deployments"** → click **"Redeploy"**.

3. **Success** when you see a green checkmark and live URL (e.g., `oreoluwa-site.vercel.app`).

### Step 7: Verify Everything Works

1. **Check environment is configured:**
   ```
   https://YOUR_DEPLOYMENT.vercel.app/api/_internal/env-check
   ```
   Should show Cloudinary and database vars loaded (no secrets exposed).

2. **Test upload flow:**
   - Go to `https://YOUR_DEPLOYMENT.vercel.app`
   - Scroll to "Personal Gallery" → click **+** icon
   - Upload image → preview modal appears → click "Confirm and send"
   - Modal closes, success message shown

3. **Test admin approval:**
   - Go to `https://YOUR_DEPLOYMENT.vercel.app/admin`
   - Log in with `ADMIN_PASSWORD`
   - Uploaded image appears in **"Pending Uploads"**
   - Click **"Approve"** → image moves to "Approved"
   - Refresh gallery → approved image appears publicly

### Step 8: Troubleshooting

**Modal doesn't appear after upload:**
- Check browser DevTools → Console for errors
- Verify `CLOUDINARY_UPLOAD_PRESET` is correct
- Confirm Cloudinary response has `secure_url`, `public_id`, `resource_type`

**"Database not configured" error:**
- Verify `DATABASE_URL` is set in Vercel env vars
- Check that Neon connection string starts with `postgresql://`
- Confirm database schema was created (Step 5)

**Upload registered but not in admin pending list:**
- Check Neon: go to **SQL Editor** and run:
  ```sql
  SELECT COUNT(*) FROM personal_uploads;
  ```
- If count is 0, schema wasn't created — go back to Step 5

**Admin login fails:**
- Verify `ADMIN_PASSWORD` is set in Vercel env vars
- Try hard refresh: Ctrl+Shift+R (Cmd+Shift+R on Mac)

**Deployment fails during build:**
- Check Vercel build logs: **Deployments → [Latest] → "Build Logs"**
- Common cause: Missing env vars → add them in project settings

### Local Development with Neon

To develop locally using live Neon database:

1. Copy your Neon connection string:
   ```bash
   # From Neon console, copy the PostgreSQL connection string
   ```

2. Create `.env.local` in project root:
   ```
   DATABASE_URL=postgresql://user:password@host/dbname
   CLOUDINARY_CLOUD_NAME=your_cloud
   CLOUDINARY_UPLOAD_PRESET=your_preset
   CLOUDINARY_API_KEY=your_key
   CLOUDINARY_API_SECRET=your_secret
   ADMIN_PASSWORD=your_password
   SESSION_SECRET=your_session_secret
   ```

3. Run dev server:
   ```bash
   npm run dev
   ```

4. Uploads will sync with live Neon database (for testing production flow).

### Architecture

- **Frontend:** React 19 + TypeScript, Vite, Tailwind
- **Upload:** Canvas transform (EXIF strip, resize 2400px) → Cloudinary unsigned upload → `/api/personal/register` (stores metadata in Neon)
- **Admin:** `/api/personal/pending` (read pending from Neon) → `/api/personal/approve` (update status in Neon)
- **Gallery:** `/api/personal/approved` (query Neon) + fallback to static manifest
- **Database:** Neon Postgres with `personal_uploads` table (id, public_id, secure_url, resource_type, folder, status, created_at, approved_at, approved_by)

### Why Neon?

- ✅ Serverless-friendly (HTTP connections)
- ✅ Auto-scaling
- ✅ Free tier with 3 GB storage
- ✅ Official Vercel integration
- ✅ Better than deprecated Vercel Postgres

### Still Having Issues?

1. Vercel logs: **Deployments → [Latest] → "Function Logs"**
2. Neon status: [status.neon.tech](https://status.neon.tech)
3. Network tab: Check `/api/personal/*` requests for errors
4. Verify all env vars match the names in code (case-sensitive)

