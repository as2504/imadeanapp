

# Plan: Build App Detail Page

## Overview

Create an `/app/:id` page that opens when users click "Try" or tap an app card. The page follows the reference screenshots: hero header with identity + CTA, stats bar, screenshot carousel, description, tech stack, comments section, and related apps.

## 1. Page & Routing

- Create `src/pages/AppDetail.tsx`
- Add route `/app/:id` in `App.tsx` (protected)
- Update `AppCard.tsx` and `TrendingCard.tsx` "Try" buttons to navigate to `/app/:id`

## 2. Page Layout (Top → Bottom)

Based on the uploaded reference screenshots:

**Header/Hero:**
- Left: squircle app icon, app name (large bold), tagline, publisher name (clickable link), posted time, tag pills
- Right: "Try App" primary CTA button, platform icons (web/android/ios)

**Quick Stats Bar:**
- Inline row: `👍 1.2K Likes · 💬 320 Comments · 👁 5.6K Visits · Published 2 days ago`

**Screenshots Carousel:**
- Horizontal scrollable row of screenshots with rounded corners
- Click to expand (optional for MVP)

**Description Section:**
- Two-column on desktop: left = full description text, right = tech stack chips + platform availability
- Matches the reference layout exactly

**Social Action Bar:**
- Like (heart + count), Share, Save buttons — clean inline row

**Comments Section ("Community Feedback"):**
- List of comments with avatar, name, time, text, like count, reply link
- Add comment input at top

**Related Apps ("You may also like"):**
- 3 small app cards at bottom with icon, name, tagline

## 3. Components

- `src/pages/AppDetail.tsx` — main page, fetches app from DB by ID
- `src/components/app-detail/AppDetailHeader.tsx` — hero with icon, name, tagline, CTA
- `src/components/app-detail/AppDetailStats.tsx` — stats bar
- `src/components/app-detail/AppDetailScreenshots.tsx` — screenshot carousel
- `src/components/app-detail/AppDetailDescription.tsx` — description + tech stack + platforms
- `src/components/app-detail/AppDetailActions.tsx` — like/share/save bar
- `src/components/app-detail/AppDetailComments.tsx` — comments list + add comment
- `src/components/app-detail/RelatedApps.tsx` — similar apps row

## 4. Data

- Fetch app from `apps` table by ID, join with `profiles` for publisher info
- Comments: For MVP, use mock comments (no comments table yet). Can add DB table later.
- Related apps: query apps with matching tags, exclude current app, limit 3

## 5. Navigation Integration

- `AppCard` "Try" button → navigates to `/app/:id` instead of external link
- `TrendingCard` "Try" button → same
- Add back button in detail page header to return to previous page
- Mobile: sticky "Try App" button at bottom

## Technical Details

- Uses existing `apps` table schema (no migration needed)
- Fetches publisher profile via separate query on `profiles` table using `user_id`
- Screenshot carousel uses horizontal scroll with `scrollbar-hide` utility
- Skeleton loaders while data loads
- Responsive: stacked layout on mobile, two-column description area on desktop

