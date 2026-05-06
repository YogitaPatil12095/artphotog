# Folio Gallery (Vite + React Router)

A folder-based photo gallery with admin dashboard. Migrated from Next.js to Vite + React Router for Netlify deployment.

## Features

### Public Site
- **Homepage** — Stacked folder cards showing all public albums
- **Folder view** — Masonry gallery with natural image ratios
- **Lightbox** — Click any image for full-screen preview with navigation
- **Responsive** — Works beautifully on all screen sizes

### Admin Dashboard (`/admin`)
- **Protected login** via Supabase Auth
- **Folder management** — Create, edit, delete, reorder folders (drag & drop)
- **Visibility toggle** — Public / Private per folder
- **Image management** — Drag & drop upload, reorder, caption, delete
- **Image filters** — Apply filters at upload time with live preview
- **Move images** — Move images between folders
- **Set cover** — Set any image as the folder cover image

### Image Filters
- None / Original
- Soft Warm
- Dusty Vintage
- Muted Pastel
- Film Grain
- Cool Blue
- Black & White
- Low Contrast

## Tech Stack

- **Vite** (build tool)
- **React 18** + **React Router v6**
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (Auth + Storage + PostgreSQL)
- **Framer Motion** (animations)
- **dnd-kit** (drag & drop)
- **react-masonry-css** (masonry layout)
- **react-dropzone** (file upload)
- **browser-image-compression** (auto compression)

## Setup

### 1. Clone and install

```bash
cd folio-gallery-vite
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `../supabase/schema.sql` (or `../schema.sql`)
3. Go to **Storage** → verify the `gallery` bucket exists and is public
4. Go to **Authentication** → **Users** → Add your admin user

### 3. Environment variables

```bash
cp .env.local.example .env.local
```

Fill in your Supabase URL and anon key from **Settings → API**:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Routes

| Route | Description |
|-------|-------------|
| `/` | Public gallery homepage |
| `/folder/:slug` | Individual folder/album view |
| `/admin/login` | Admin login |
| `/admin` | Admin dashboard |
| `/admin/folders` | Folder management |
| `/admin/folders/:id` | Folder detail + image management |

## Deploying to Netlify

### Option 1: Netlify UI

1. Push this code to GitHub/GitLab
2. Go to [app.netlify.com](https://app.netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect your repository
5. Configure build settings:
   - **Base directory**: `folio-gallery-vite`
   - **Build command**: `npm run build`
   - **Publish directory**: `folio-gallery-vite/dist`
6. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
7. Deploy!

### Option 2: Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

The `netlify.toml` is already configured for SPA routing.

## Color Theme

| Name | Hex |
|------|-----|
| Charcoal | `#3B3735` |
| Cream | `#D8D1BF` |
| Dusty Pink | `#D8B7B3` |
| Soft Blue | `#B7C8CF` |
| Off White | `#F4F0E8` |
| Muted Text | `#2F2F2F` |
| Warm Brown | `#8B7355` |

## Image Compression

Images are automatically compressed before upload using `browser-image-compression`:
- Max size: 2MB
- Max dimensions: 2400px
- EXIF data preserved
- Quality preserved as much as possible

## Notes

- The admin is a single user system — create one admin user via Supabase Auth dashboard
- Images are served directly from Supabase Storage CDN
- All drag & drop interactions work on touch devices
- Client-side routing with React Router v6

## Migration from Next.js

This project was migrated from Next.js 14 to Vite + React Router for better Netlify compatibility:
- Replaced `next/image` with standard `<img>` tags
- Replaced `next/link` with `react-router-dom` `<Link>`
- Replaced server components with client-side data fetching
- Replaced `next/font/google` with standard Google Fonts CDN
- All functionality preserved, just different routing/rendering approach
