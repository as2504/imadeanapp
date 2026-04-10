

# Plan: Search History Fix, Trending Docs, Creator Avatars, Notifications

## 1. Fix Recent Searches Not Showing

**Problem:** The `handleFocus` in `SearchBar.tsx` only shows recent searches when `query.trim().length < 2`, but the `showRecent` state gets reset by the `useEffect` on line 61 which runs when `query` changes. When clicking into the search bar with an empty query, `handleFocus` sets `showRecent = true`, but the `useEffect` immediately runs (query is empty, length < 2), calling `setOpen(false)` — this doesn't directly reset `showRecent`, but the condition `showRecent && !open` should work. The real issue is likely that the `useEffect` on line 60-78 fires on mount and on every keystroke, and on initial focus it may race with `handleFocus`.

**Fix in `SearchBar.tsx`:**
- In the `useEffect` for query (line 60), add a guard: only set `setShowRecent(false)` when `query.trim().length >= 2` (i.e., when an actual search starts), not when query is empty
- Also ensure `handleFocus` is called via `onClick` as well (not just `onFocus`), since some browsers don't re-fire focus on an already-focused input

## 2. Create `trending.md` Documentation

**New file: `trending.md`** — document:
- Algorithm overview (gravity-based time-decay formula)
- Engagement weights table (Tries: 15, Feedback: 10, Reviews: 5, Saves: 4, Review Likes: 2, Ratings: 1)
- Formula: `TrendingScore = (EngagementScore * AvgRating) / POWER((AgeInHours + 2), 1.5)`
- Tables used: `app_clicks`, `app_feedback_responses`, `ratings`, `saved_apps`, `comments`, `apps`
- Anti-bias measures: unique constraints, `SECURITY DEFINER` RPC, time-decay gravity
- Time filter options (today, week, month, all)

## 3. Creator Avatars in "Top Creators This Week"

**Fix in `FeedSidebar.tsx`:**
- Fetch `avatar_url` alongside `display_name, username` from `profiles`
- Add `avatar?: string` to the `topCreators` state type
- Replace the letter-initial `div` with an `img` when `avatar_url` exists, fallback to the initial letter

## 4. Notification Button — "No New Notifications" Popover

**Fix in `FeedNavbar.tsx`:**
- Wrap the Bell button in a `Popover` (from existing UI components)
- On click, show a small dropdown with a `BellOff` icon and "No new notifications" text
- Keep the existing styling

---

## Files Summary

| File | Change |
|---|---|
| `src/components/feed/SearchBar.tsx` | Fix recent search display on focus/click |
| `trending.md` | New documentation file |
| `src/components/feed/FeedSidebar.tsx` | Fetch and display creator avatar images |
| `src/components/feed/FeedNavbar.tsx` | Add notification popover with empty state |

