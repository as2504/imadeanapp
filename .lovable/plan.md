

# Plan: Multi-Feature Update

## Summary

This is a large batch of changes covering: profile page width alignment, real database feed, comments system, screenshot/icon uploads, avatar dropdown menu, landing page cleanup, "Explore" removal, and seeding 10 users with 30 apps and comments.

---

## 1. Database Changes (Migration)

### Comments table
```sql
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  likes_count INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
-- Everyone can read comments on published apps
-- Authenticated users can insert their own comments
-- Users can delete their own comments
```

### Storage RLS for app-assets bucket
Add policies allowing authenticated users to upload to `app-assets` and public read access.

---

## 2. Seed Dummy Data (Migration)

Insert 10 fake users into `profiles` table and 30 apps (3 per user) with:
- Unique vibe-coding SaaS ideas (e.g., "VibeShip - AI deployment pipeline", "PromptForge - prompt engineering IDE", "CodeMood - developer wellness tracker")
- Varied `created_at` dates (today, this week, this month) for filter testing
- Mix of platforms: some web-only, some web+android, some all three, with dummy URLs
- Tags, tech stacks, captions, taglines
- Varied likes/comments/views counts
- Status: `published`

Insert ~90 comments across the 30 apps (3 per app), mix of genuine positive and constructive negative feedback, with different `created_at` dates.

---

## 3. Profile Page Width Alignment

**File:** `src/pages/Profile.tsx`

Change `max-w-4xl` to `max-w-[1080px]` and use `px-4 lg:px-6` to match the `FeedLayout` container width exactly.

---

## 4. Connect Home Feed to Real Database

**File:** `src/pages/HomeFeed.tsx`

- Replace `mockPosts` import with a `useEffect` that fetches from `supabase.from("apps").select("*").eq("status", "published").order("created_at", { ascending: false })`
- Also fetch publisher profiles for display names
- Map DB rows to the `AppPost` interface used by `AppCard`

**File:** `src/pages/Trending.tsx`

- Replace `mockTrending` with real DB query ordered by `likes_count` descending
- Map to `TrendingApp` interface

**File:** `src/components/profile/ProfilePublishedApps.tsx`

- Fetch current user's apps from DB instead of `mockPosts`

**File:** `src/components/profile/ProfileSavedApps.tsx`

- For now, show empty state (saved apps require a separate saved_apps table — future feature)

---

## 5. Real Comments System

**File:** `src/components/app-detail/AppDetailComments.tsx`

- Replace mock comments with real DB fetch: `supabase.from("comments").select("*, profiles(display_name, username)").eq("app_id", appId)`
- Add comment insertion: `supabase.from("comments").insert({ app_id, user_id, text })`
- Accept `appId` prop from `AppDetail.tsx`

**File:** `src/pages/AppDetail.tsx`

- Pass `app.id` to `AppDetailComments`

---

## 6. Screenshot & Icon Uploads

**File:** `src/components/publish/PublishForm.tsx`

- Add screenshot upload section (1-5 images)
- Upload screenshots to `app-assets` storage bucket under `{user_id}/screenshots/`
- Store public URLs in the `screenshots` array column
- Icon upload already exists — ensure it saves properly

---

## 7. Avatar Dropdown Menu (Floating Nav)

**File:** `src/components/feed/FeedNavbar.tsx`

- Replace the avatar click (`navigate("/account")`) with a `Popover` or `DropdownMenu` containing:
  - "Account" — navigates to `/account`
  - Dark mode toggle (switch component, toggles `dark` class on `<html>`)
  - Separator line
  - "Log out" button — calls `signOut()`
- Remove the standalone `LogOut` button from the navbar

---

## 8. Remove "Explore" Option

**Files:** `src/components/feed/FeedNavbar.tsx`, `src/components/landing/Navbar.tsx`

- Remove "Explore" from `navItems` array in FeedNavbar
- Remove "Explore" from `navLinks` in landing Navbar
- Remove `/explore` references if any exist in routing

---

## 9. Landing Page Nav Cleanup

**File:** `src/components/landing/Navbar.tsx`

- Update `navLinks` to only show pre-login relevant links: "Home", "About", "Contact" (remove "Explore")
- Keep "Join Now" button

---

## Files Summary

| File | Action |
|---|---|
| Migration SQL | Create `comments` table, storage policies, seed data |
| `src/pages/Profile.tsx` | Align width to `max-w-[1080px]` |
| `src/pages/HomeFeed.tsx` | Fetch apps from DB |
| `src/pages/Trending.tsx` | Fetch trending from DB |
| `src/pages/AppDetail.tsx` | Pass appId to comments |
| `src/components/feed/FeedNavbar.tsx` | Remove Explore, avatar dropdown |
| `src/components/landing/Navbar.tsx` | Remove Explore |
| `src/components/app-detail/AppDetailComments.tsx` | Real comments CRUD |
| `src/components/profile/ProfilePublishedApps.tsx` | Fetch from DB |
| `src/components/profile/ProfileSavedApps.tsx` | Show empty state |
| `src/components/publish/PublishForm.tsx` | Add screenshot uploads |

