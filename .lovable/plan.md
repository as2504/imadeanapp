

# Plan: Trending Numbers, Reviews, Settings, Mobile Touch, Social Links, Docs

## 1. Trending Card — Rank Number on Icon

**Problem:** Double-digit rank numbers appear behind/below the icon, not overlaid on it.

**Fix in `TrendingCard.tsx`:** Move the rank number from an `absolute -left-1` sibling into an overlay badge positioned on the bottom-left corner of the icon `div`. Use a small circular badge with dark background and bold text sitting on the icon.

## 2. Trending Filters — Persist Selection

**Fix in `Trending.tsx`:** Store the filter state in `sessionStorage` on change, and initialize from `sessionStorage` on mount. This way navigating away and back preserves the filter.

## 3. Move Log Out to Settings Page

**`FeedNavbar.tsx`:** Remove the "Log out" `DropdownMenuItem` from the avatar dropdown.

**`Settings.tsx`:** Add a new "Account" section (or append to "General") with a "Log out" button at the bottom, styled as a destructive action.

## 4. Beta Badge on App Feedback in Settings

**`Settings.tsx`:** Add a small "Beta" badge next to the "App Feedback" label in the sidebar/mobile dropdown.

## 5. Generate `supabasedb.md` and `supabaseauth.md`

Create two markdown files at the project root with detailed step-by-step migration and auth integration guides based on the current schema and auth setup.

## 6. Fix Mobile Touch — Published Apps Dropdown Trigger

**Problem:** On mobile, wrapping `AppCard` inside `DropdownMenuTrigger` means any touch (including scroll) opens the dropdown.

**Fix in `ProfilePublishedApps.tsx`:** Remove the `DropdownMenuTrigger` wrapping the entire card. Instead, add a small "more options" button (`MoreVertical` icon) in the top-right corner of each card. The card itself navigates to the app detail page on click. The three-dot button opens the dropdown. This separates navigation from actions and prevents scroll-triggered menus.

## 7. Reviews — Edit Not Reflecting, Likes Resetting

**Edit not reflecting:** The `comments` table RLS is missing an UPDATE policy. Users can't update their own comments. Need a migration to add UPDATE policy.

**Likes resetting:** `handleLike` does optimistic update but on page change/refresh, `likes_count` is fetched from DB. The update uses the stale `review.likes_count` from the found item (which may already be optimistically incremented). Also, there's no per-user like tracking — any user can like infinitely and likes reset because there's no `comment_likes` table.

**Fix:**
- Migration: Add UPDATE RLS policy on `comments` for own comments.
- For likes: Create a `comment_likes` table (`id, comment_id, user_id, created_at`) with unique constraint on `(comment_id, user_id)`. Add RLS. Update `handleLike` to insert into `comment_likes` and increment `likes_count` via a DB function or direct increment. On fetch, check if current user has liked each comment.

## 8. Social Links Not Saving from Edit Profile

**Problem:** `EditProfile.tsx` `handleSave` doesn't write `github_url`, `twitter_url`, `linkedin_url`, `website`, `portfolio_url`, `instagram_url`, `leetcode_url` to the profiles table. The `EditProfileLinks` component manages `links` state but it's never persisted.

**Fix in `EditProfile.tsx`:** In `handleSave`, extract social link URLs from the `links` array by platform and include them in the update payload. Also on fetch, populate `links` from the profile's social URL columns.

---

## Database Migration

```sql
-- Allow users to update their own comments
CREATE POLICY "Users can update their own comments"
ON public.comments FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Comment likes table for persistent per-user likes
CREATE TABLE public.comment_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comment likes viewable by everyone"
ON public.comment_likes FOR SELECT TO public USING (true);

CREATE POLICY "Users can like"
ON public.comment_likes FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike"
ON public.comment_likes FOR DELETE TO authenticated
USING (auth.uid() = user_id);
```

---

## Files Summary

| File | Change |
|---|---|
| `src/components/trending/TrendingCard.tsx` | Rank badge overlaid on icon |
| `src/pages/Trending.tsx` | Persist filters in sessionStorage |
| `src/components/feed/FeedNavbar.tsx` | Remove logout from dropdown |
| `src/pages/Settings.tsx` | Add logout button, beta badge on feedback |
| `src/components/profile/ProfilePublishedApps.tsx` | Replace card-as-trigger with MoreVertical button |
| `src/components/app-detail/AppDetailReviews.tsx` | Fix likes with `comment_likes` table, fix edit refresh |
| `src/pages/EditProfile.tsx` | Save/load social link URLs |
| `supabasedb.md` | **New** — DB migration guide |
| `supabaseauth.md` | **New** — Auth integration guide |
| **Migration SQL** | UPDATE policy on comments, `comment_likes` table |

