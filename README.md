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

## Deployment (GitHub + Vercel + Postgres Database)

This guide walks you through deploying the app to Vercel with a Postgres database for the admin upload moderation queue. Follow each step carefully to avoid issues.

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

### Step 2: Create a Vercel Postgres Database

1. Go to [vercel.com](https://vercel.com) and sign in (use your GitHub account).
2. Click **"Add New..." → "Database"** (top right of dashboard).
3. Select **"Postgres"** and click **"Create"**.
4. Choose a region closest to your users (US East recommended).
5. Copy the **connection string** that appears — you'll need this in the next step.
6. The Postgres database is now ready. Keep the connection string handy.

### Step 3: Create a Vercel Project

1. In the Vercel dashboard, click **"Add New..." → "Project"**.
2. Import your GitHub repo (select your `oreoluwa-site` repo).
3. Click **"Import"** and continue with the default settings.

### Step 4: Configure Environment Variables

In the Vercel project settings:

1. Go to **"Settings" → "Environment Variables"**.
2. Add the following variables (find values in `.env.example` or from Cloudinary):

   **Cloudinary Vars (get from Cloudinary dashboard):**
   - `CLOUDINARY_CLOUD_NAME` — your Cloudinary cloud name
   - `CLOUDINARY_UPLOAD_PRESET` — your unsigned upload preset (created in Cloudinary)
   - `CLOUDINARY_FOLDER` — optional, default: `OREOLUWA PERSONAL`
   - `CLOUDINARY_API_KEY` — found in Cloudinary Account Settings (server only)
   - `CLOUDINARY_API_SECRET` — found in Cloudinary Account Settings (server only)

   **Database & Auth Vars:**
   - `POSTGRES_URL` — paste the Postgres connection string from Step 2
   - `POSTGRES_URL_NON_POOLING` — same as `POSTGRES_URL` (Vercel Postgres best practice)
   - `ADMIN_PASSWORD` — create a strong password for admin login (e.g., `MyStrongPassword123!`)
   - `SESSION_SECRET` — generate a random string (e.g., use `openssl rand -hex 32`)

   **Mark these as "Server Only":**
   - All Cloudinary vars except `CLOUDINARY_UPLOAD_PRESET`
   - All database vars
   - `SESSION_SECRET`

### Step 5: Run the Database Schema

The app needs a table to store upload records. You have two options:

**Option A: Use Vercel CLI (Recommended)**

1. Install Vercel CLI if you haven't:
   ```bash
   npm install -g vercel
   ```

2. In your project root, connect to your Vercel project:
   ```bash
   vercel link
   ```

3. Pull the database connection string:
   ```bash
   vercel env pull .env.local
   ```

4. Run the schema file:
   ```bash
   psql $(grep POSTGRES_URL .env.local | cut -d'=' -f2) -f database/personal_uploads.sql
   ```

   (On Windows, use the connection string from the `.env.local` file manually in a Postgres client)

**Option B: Vercel Dashboard**

1. In the Vercel dashboard, go to your project → **"Storage" → "Postgres"**.
2. Click **"Query"** and paste the contents of `database/personal_uploads.sql`.
3. Click **"Run"** to create the table.

### Step 6: Deploy to Vercel

1. **Automatic deployment** (recommended): 
   - Commit your env var changes (they're configured in the dashboard, not in code).
   - Push a commit to GitHub:
     ```bash
     git add .
     git commit -m "Setup Postgres environment"
     git push
     ```
   - Vercel auto-deploys on push. Watch the **"Deployments"** tab.

2. **Manual deployment**:
   - In the Vercel dashboard, go to **"Deployments"** and click **"Redeploy"** on the latest commit.

3. **Deployment completes** when you see a green checkmark and a live URL (e.g., `oreoluwa-site.vercel.app`).

### Step 7: Verify Everything Works

1. **Check environment variables are loaded:**
   ```
   https://YOUR_DEPLOYMENT.vercel.app/api/_internal/env-check
   ```
   This should show which Cloudinary and database variables are configured (without revealing secrets).

2. **Test the upload flow:**
   - Go to your live site: `https://YOUR_DEPLOYMENT.vercel.app`
   - Scroll to "Personal Gallery" and click the **+** icon.
   - Upload an image → preview modal should show → click "Confirm and send".
   - The modal should close and show a success message.

3. **Test admin approval:**
   - Go to `https://YOUR_DEPLOYMENT.vercel.app/admin`.
   - Log in with your `ADMIN_PASSWORD`.
   - Your uploaded image should appear in the **"Pending Uploads"** list.
   - Click **"Approve"** to move it to "Approved".
   - Refresh the gallery — your approved image should appear publicly.

### Step 8: Troubleshooting

**Modal doesn't show after upload:**
- Check browser DevTools → Console for errors.
- Verify `CLOUDINARY_UPLOAD_PRESET` is set correctly.
- Confirm the Cloudinary upload response includes `secure_url`, `public_id`, and `resource_type`.

**Admin pending list shows error:**
- Check Vercel Function logs: **Deployments → [Latest] → Functions**.
- Verify `POSTGRES_URL` is set and the database schema was created (Step 5).
- Run the schema again if needed.

**Upload registered but doesn't appear in admin:**
- Check Postgres: Query `SELECT * FROM personal_uploads;` to see if records exist.
- If table is empty, the schema may not have run — go back to Step 5.

**404 on `/admin` endpoint:**
- Verify `ADMIN_PASSWORD` is set in Vercel environment variables.
- Try a hard refresh (Ctrl+Shift+R or Cmd+Shift+R).

**"Failed to register upload" error:**
- Check that `/api/personal/register` exists in the repo.
- Verify `POSTGRES_URL_NON_POOLING` is set alongside `POSTGRES_URL`.
- Check Vercel Postgres usage limits (free tier has limits).

### Optional: Local Development with Vercel Postgres

To test locally against the live database:

1. Pull environment variables:
   ```bash
   vercel env pull .env.local
   ```

2. Run the dev server:
   ```bash
   npm run dev
   ```

3. The server will use your live Postgres database (so uploads will sync with production).

### What Happens Behind the Scenes

- **Upload Flow:** User → Cloudinary (image storage) → `/api/personal/register` (saves metadata to Postgres as pending)
- **Admin Approval:** Admin clicks approve → `/api/personal/approve` (updates Postgres status to approved)
- **Public Gallery:** `GET /api/personal/approved` (queries Postgres for approved uploads + fallback to static manifest)
- **Database:** `personal_uploads` table stores: id, public_id, secure_url, resource_type, folder, status, created_at, approved_at, approved_by

### Still Having Issues?

Check the following in order:
1. Vercel deployment logs: **Deployments → [Latest] → Logs**
2. Postgres connectivity: **Storage → Postgres → Metrics**
3. Browser DevTools Network tab: Look for failed API calls to `/api/personal/*`
4. `.env.example` in the repo: Ensure all required env vars are set with correct names

