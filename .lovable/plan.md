

# Plan: Fix Uploads, Remove Fake Data, Reviews, Trending Medals, Landing Redirect

## 1. Fix App Icon Upload (PublishForm)

**Problem:** `PublishForm.tsx` saves `URL.createObjectURL(file)` as the `app_icon_url` — a blob URL that's only valid in the current session.

**Fix:** Upload the icon file to the `app-assets` storage bucket, get the public URL, and save that instead. Same for screenshots. Store the `File` objects in state and upload them in `handleSubmit` before inserting the app record.

## 2. Fix Profile Avatar — "Bucket not found"

**Problem:** `EditProfileAvatar.tsx` uploads to bucket `avatars` which doesn't exist. Only `app-assets` exists.

**Fix:** Change the bucket from `'avatars'` to `'app-assets'` and use a path prefix like `avatars/{user_id}/...`.

## 3. Publisher Name Links to Profile

**Fix in `AppDetailHeader.tsx`:** Wrap the publisher name in a clickable link that navigates to `/profile/{publisherUserId}`. Pass `publisherUserId` through the `app` prop (already available in `AppDetail.tsx` as `appData.publisherUserId`).

## 4. Review Likes Fix + Delete Review

**Likes issue:** The `handleLike` function updates `likes_count` on the `comments` table using stale values. Fix by using a DB increment approach or refetching after mutation.

**Delete review:** Add a `Trash2` icon button next to the edit `Pencil` button in `ReviewCard` (only for the review author). On click, delete from `comments` table and refresh.

## 5. Trending Card Medals (Gold/Silver/Bronze)

**Fix in `TrendingCard.tsx`:** For rank 1, 2, 3 — add a colored border/outline to the card:
- Rank 1: `border-yellow-500/60` (gold)
- Rank 2: `border-gray-400/60` (silver)  
- Rank 3: `border-amber-700/60` (bronze)

## 6. Remove ALL Fake/Mock Data

**Delete files:**
- `src/data/mockPosts.ts`
- `src/data/mockTrending.ts`

**Update components that import them:**
- `TrendingCard.tsx` — remove `TrendingApp` import, define a local interface
- `Trending.tsx` — remove `TrendingApp` import, use local type

**Replace fake sidebar data with real DB queries:**
- `FeedSidebar.tsx` — fetch top creators (by app count), most rated apps, most reviewed apps from DB
- `TrendingSidebar.tsx` — fetch real trending tech stacks and tags from published apps via DB aggregation

## 7. Landing Page Redirect for Logged-in Users

**Fix in `App.tsx`:** Wrap the `"/"` route with `PublicOnlyRoute` so logged-in users get redirected to `/home`.

## 8. Fix Edge Function Build Error

**Fix in `supabase/functions/og-meta/index.ts` line 72:** Change `err.message` to `(err as Error).message`.

---

## Database Migration

Create an `avatars` path in `app-assets` bucket (no migration needed, just use path prefix).

No new tables required.

---

## Files Summary

| File | Change |
|---|---|
| `src/components/publish/PublishForm.tsx` | Upload icon/screenshots to `app-assets` bucket |
| `src/components/edit-profile/EditProfileAvatar.tsx` | Change bucket from `avatars` to `app-assets` |
| `src/components/app-detail/AppDetailHeader.tsx` | Make publisher name clickable → `/profile/:userId` |
| `src/components/app-detail/AppDetailReviews.tsx` | Fix likes, add delete review button |
| `src/components/trending/TrendingCard.tsx` | Gold/silver/bronze border for top 3, remove mock import |
| `src/pages/Trending.tsx` | Remove mock data import, use local type |
| `src/components/feed/FeedSidebar.tsx` | Replace hardcoded data with real DB queries |
| `src/components/trending/TrendingSidebar.tsx` | Replace hardcoded data with real DB queries |
| `src/data/mockPosts.ts` | **Delete** |
| `src/data/mockTrending.ts` | **Delete** |
| `src/App.tsx` | Wrap `/` route with `PublicOnlyRoute` |
| `supabase/functions/og-meta/index.ts` | Fix `err` type cast |

