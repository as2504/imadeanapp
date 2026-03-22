

# Plan: Build Publish App Page

## Overview

Create a "Publish App" page with a 2-column layout (form + live preview), backed by a new `apps` database table. The page opens from "Publish App" button on profile and the "+" icon on mobile bottom nav.

## 1. Database Migration

Create an `apps` table with RLS policies:

```sql
CREATE TABLE public.apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  app_name TEXT NOT NULL,
  tagline TEXT,
  short_description TEXT,
  full_description TEXT,
  app_icon_url TEXT,
  tags TEXT[] DEFAULT '{}',
  tech_stack TEXT[] DEFAULT '{}',
  platforms TEXT[] DEFAULT '{}',
  website_url TEXT,
  play_store_url TEXT,
  app_store_url TEXT,
  github_url TEXT,
  demo_video_url TEXT,
  pricing TEXT DEFAULT 'free',
  caption TEXT,
  screenshots TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft',  -- 'draft' or 'published'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  views_count INT DEFAULT 0
);
```

RLS: Users can CRUD their own apps; everyone can SELECT published apps.

Also create a storage bucket `app-assets` (public) for app icons and screenshots.

## 2. Publish Page (`src/pages/PublishApp.tsx`)

**Layout:** Two-column on desktop (form left, live preview right), stacked on mobile.

**Header:** "Publish your creation." heading + subtitle + back button.

**Form sections** (left column):
1. **App Identity** - Icon upload (squircle preview), app name input, one-line tagline
2. **Description** - Full description textarea
3. **Tech Stack & Tags** - Searchable chip input for tech stack; tag selection (max 5)
4. **Platform Selection** - 3 toggleable platform icons (Web/Android/iOS), conditional URL inputs
5. **Feed Presentation** - Caption textarea, screenshot uploads (1-5 images)
6. **Advanced Settings** - Collapsible section: GitHub link, pricing, demo video

**Live Preview** (right column):
- Real-time feed card preview matching `AppCard` design
- Shows icon, name, publisher, caption, tags, platform icons
- Updates as user types

**Actions:** "Save Draft" (secondary) and "Publish App" (primary CTA) at bottom.

## 3. Components

- `src/components/publish/PublishForm.tsx` - Main form with all sections
- `src/components/publish/LivePreview.tsx` - Real-time card preview
- `src/components/publish/PlatformSelector.tsx` - Platform icon toggles + URL inputs
- `src/components/publish/TagInput.tsx` - Reusable chip/tag input component
- `src/components/publish/ScreenshotUploader.tsx` - Multi-image upload with preview

## 4. Routing & Navigation

- Add `/publish` route in `App.tsx` (protected)
- Wire "Publish App" button in `ProfileHeader.tsx` to navigate to `/publish`
- Wire mobile bottom nav "+" / publish icon to `/publish`
- Wire navbar "Publish" button to `/publish`

## 5. Behavior

- Form state managed with React state (not react-hook-form for simplicity)
- Save Draft: inserts/updates app with `status: 'draft'`
- Publish: sets `status: 'published'`, shows success toast, redirects to profile
- Soft validation: highlights missing required fields (name, icon, at least 1 platform + URL)
- File uploads go to `app-assets` storage bucket via Supabase storage API

## Technical Details

- Images uploaded to Supabase storage `app-assets` bucket, public URLs stored in the apps table
- `updated_at` trigger reused from existing `update_updated_at_column` function
- Tags use a predefined list: AI, Productivity, Developer Tools, Design, Automation, SaaS, Mobile, No-Code
- Tech stack suggestions: React, Next.js, Supabase, Firebase, OpenAI, Flutter, Tailwind, Node.js (with custom entry support)

