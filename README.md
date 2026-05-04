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

## Deployment (GitHub + Vercel)

1. Create a new GitHub repo and push this project to it:

  ```bash
  git init
  git add .
  git commit -m "Initial commit"
  git branch -M main
  git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO.git
  git push -u origin main
  ```

2. Add environment variables in the Vercel dashboard (Project Settings -> Environment Variables) using the names in `.env.example`.

  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY` (server)
  - `CLOUDINARY_API_SECRET` (server)
  - `CLOUDINARY_UPLOAD_PRESET` (client unsigned preset)
  - `CLOUDINARY_FOLDER` (optional, default: `OREOLUWA PERSONAL`)
  - `ADMIN_PASSWORD` (admin login)
  - `SESSION_SECRET`

3. Connect the GitHub repo to Vercel and deploy. Vercel will run the `build` script from `package.json`.

4. (Optional) To preview locally using Vercel CLI (you already authorized):

  ```bash
  npx vercel dev
  ```

5. After deployment, verify the server environment via the internal endpoint:

  - `https://<your-deployment>.vercel.app/api/_internal/env-check`

This endpoint returns which Cloudinary env vars are present (it does not reveal secrets).
