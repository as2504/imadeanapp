

# Plan: Migration Fix, Navbar Avatar, Image Cropper, Remove Avatar, and Username Flash Fix

## 1. Create missing `ratings` table migration

**File:** `supabase/migrations/20260409215959_create_ratings_table.sql`

The `ratings` table is referenced by the `get_trending_apps` function in migration `20260409220036`, but no prior migration creates it. A new migration with an earlier timestamp will create the table with:
- `id`, `app_id` (FK to apps), `user_id`, `rating` (1-5 CHECK), `review_text`, `created_at`
- Unique constraint on `(app_id, user_id)`
- RLS policies for public SELECT, authenticated INSERT/UPDATE/DELETE (owner only)
- Indexes on `app_id` and `user_id`

This fixes the production deployment failure.

---

## 2. Show profile avatar in navbar

**File:** `src/components/feed/FeedNavbar.tsx`

Currently the navbar shows a generic `<User>` icon. Changes:
- Fetch the current user's profile (avatar_url, display_name) from Supabase on mount using `useQuery` with a long staleTime
- Replace the static `<User>` icon with the user's avatar image (or their initial letter as fallback)
- The avatar will appear as a small rounded image in the existing 32×32 container

---

## 3. Add "Remove avatar" option

**File:** `src/components/edit-profile/EditProfileAvatar.tsx`

- When an avatar is set, show a small `X` / trash icon badge (opposite corner from the camera badge)
- Clicking it calls `onImageChange("")` (or `null`) to clear the avatar
- Add a confirmation tooltip or small dialog: "Remove profile photo?"

**File:** `src/pages/EditProfile.tsx`
- Ensure `handleSave` sends `avatar_url: profile.avatarUrl || null` so empty string becomes null in DB

---

## 4. Image crop/position selector for avatar upload

**File:** `src/components/edit-profile/EditProfileAvatar.tsx`

When a user selects an image, instead of uploading immediately:
1. Read the file as a data URL and open a crop dialog
2. Show the image in a square crop area with drag-to-reposition and pinch/scroll-to-zoom
3. User confirms → the visible area is drawn onto a canvas (e.g. 400×400) → exported as a Blob → uploaded to storage
4. This uses a lightweight custom canvas-based cropper (no external library needed):
   - Display image in a fixed square container
   - Track mouse/touch drag to pan the image
   - Track wheel/pinch to zoom
   - On confirm, use `canvas.drawImage()` with the computed offset/scale to produce the cropped result

This ensures all avatars are consistently square regardless of the source image dimensions.

---

## 5. Fix username flash showing email prefix

**Problem:** On page refresh, `ProfileHeader` line 44 falls back to `user?.email?.split("@")[0]` while the profile is still loading from Supabase. This briefly exposes the user's email prefix.

**Fix across multiple files:**

**`src/components/profile/ProfileHeader.tsx`:**
- Add a `loading` state that starts `true` until the profile fetch completes
- While loading, show a skeleton/placeholder instead of the email-derived fallback
- Change fallback chain: `profile?.username || (loading ? "..." : "user")`
- Same for `displayName`: show skeleton while loading

**`src/components/feed/FeedNavbar.tsx`:**
- Similar: don't show any user-derived text until profile data is fetched

This completely prevents email leakage during the loading window.

---

## Files Summary

| File | Change |
|---|---|
| `supabase/migrations/20260409215959_...` | New: create `ratings` table before trending function |
| `src/components/feed/FeedNavbar.tsx` | Show user avatar, fetch profile with useQuery |
| `src/components/edit-profile/EditProfileAvatar.tsx` | Add remove option + image crop dialog |
| `src/components/profile/ProfileHeader.tsx` | Add loading state, prevent email flash |
| `src/pages/EditProfile.tsx` | Handle null avatar on save |

