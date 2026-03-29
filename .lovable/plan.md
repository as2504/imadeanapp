

# Plan: Feed Filter Fixes, Followers/Following Modal, Smart Sticky Filters, Saved Apps

## 1. Fix Filter Bar Clipping First App

**Problem:** The sticky filter bar at `top-14` overlaps the first card.

**Fix in `HomeFeed.tsx` and `Trending.tsx`:** Add `pt-2` padding above the card list area inside the content `div`. Also reduce `py-1.5` on the sticky filter bar to `py-1` for a tighter fit closer to the top border.

## 2. Followers/Following on Profile + Popup

**`ProfileHeader.tsx`:**
- Fetch both `followerCount` and `followingCount` (query `follows` where `follower_id = targetUserId` for following count).
- Display: `@username · 12 followers · 8 following` — each count is a clickable `<button>`.
- Clicking opens a `Dialog` (from `src/components/ui/dialog.tsx`) showing the list.

**New component `src/components/profile/FollowListDialog.tsx`:**
- Props: `open`, `onClose`, `userId`, `type: "followers" | "following"`
- If `type === "followers"`: query `follows` where `following_id = userId`, join with `profiles` on `follower_id`
- If `type === "following"`: query `follows` where `follower_id = userId`, join with `profiles` on `following_id`
- Render a list of user rows: avatar + display name + username + "View Profile" link
- Uses `Dialog` + `DialogContent` with `max-w-sm`

## 3. Smart Sticky Filter Bar (Show on Scroll Up, Hide on Scroll Down)

**`HomeFeed.tsx` and `Trending.tsx`:**
- Add scroll direction detection: track `lastScrollY` with `useRef`, compare in a `scroll` event listener.
- State: `showFilters` boolean. Scrolling **up** → `true`, scrolling **down** → `false`. Always show when near top (`scrollY < 100`).
- The filter bar gets `transition-transform duration-300` and `translate-y-0` (visible) or `-translate-y-full` (hidden).
- Keep `sticky top-14 z-30` positioning.

## 4. Saved Apps — Database + Full Implementation

**Database migration:**
```sql
CREATE TABLE public.saved_apps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  app_id uuid NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, app_id)
);
ALTER TABLE public.saved_apps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own saved" ON public.saved_apps FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can save" ON public.saved_apps FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unsave" ON public.saved_apps FOR DELETE TO authenticated USING (auth.uid() = user_id);
```

**`AppDetailActions.tsx`:**
- On mount: check if current user has saved this app (query `saved_apps`)
- On click: insert or delete from `saved_apps`, toggle state
- Requires `appId` prop (add it)

**`ProfileSavedApps.tsx`:**
- Query `saved_apps` joined with `apps` and `profiles` for the current user
- Render as `AppCard` list (reuse existing component)
- Show empty state only when truly empty

---

## Files Summary

| File | Change |
|---|---|
| **Migration SQL** | Create `saved_apps` table with RLS |
| `src/pages/HomeFeed.tsx` | Add padding above cards, smart sticky scroll logic |
| `src/pages/Trending.tsx` | Same smart sticky scroll logic |
| `src/components/profile/ProfileHeader.tsx` | Add following count + clickable followers/following |
| `src/components/profile/FollowListDialog.tsx` | **New** — followers/following popup list |
| `src/components/app-detail/AppDetailActions.tsx` | Persist save to DB |
| `src/components/profile/ProfileSavedApps.tsx` | Fetch and display real saved apps |

