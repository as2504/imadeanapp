

# Plan: Performance Optimization for HomeFeed & Trending

## Priority Order (by impact)

### 1. Eliminate N+1 rating queries in cards (CRITICAL)
**Files:** `src/components/feed/AppCard.tsx`, `src/components/trending/TrendingCard.tsx`, `src/pages/HomeFeed.tsx`, `src/pages/Trending.tsx`

- Remove the per-card `useEffect` that queries `ratings` table individually
- Instead, batch-fetch all ratings for the current page's app IDs in the parent page component
- Pass `avgRating` as a prop to each card
- This eliminates 20 network requests per page load

### 2. Add react-query caching (HIGH)
**Files:** `src/pages/HomeFeed.tsx`, `src/pages/Trending.tsx`

- Replace `useState` + `useEffect` fetching with `useQuery` / `useInfiniteQuery`
- Set `staleTime: 5 * 60 * 1000` (5 minutes) so back-navigation shows cached data instantly
- Use query keys based on filters so filter changes trigger fresh fetches
- Keep the existing "Load More" UX but powered by `useInfiniteQuery`

### 3. Select only needed columns (HIGH)
**Files:** `src/pages/HomeFeed.tsx`, `src/pages/Trending.tsx`

- Replace `.select("*")` with `.select("id, slug, app_name, app_icon_url, caption, tagline, tags, platforms, tech_stack, likes_count, comments_count, views_count, user_id, created_at")`
- Reduces payload size significantly (drops `full_description`, `screenshots`, `short_description`, all URL fields)

### 4. Reduce trending over-fetch (MEDIUM)
**Files:** `src/pages/HomeFeed.tsx`, `src/pages/Trending.tsx`

- Change `max_results: 200` → `max_results: 50` for initial load
- The RPC already returns results sorted by `trending_score`, so we can trust its ordering
- For "Load More", call the RPC again with an offset or fetch the next batch

### 5. Optimize sidebar queries (MEDIUM)
**Files:** `src/components/feed/FeedSidebar.tsx`, `src/components/trending/TrendingSidebar.tsx`

- Wrap sidebar data fetching in `useQuery` with a longer `staleTime` (10+ minutes) since this data changes slowly
- This prevents re-fetching on every navigation

### 6. RPC optimization (LOW — future)
- Refactor correlated subqueries to JOINs when app count grows beyond ~5K
- Not urgent now but noted for future

## Files Summary

| File | Change |
|---|---|
| `src/components/feed/AppCard.tsx` | Remove per-card rating fetch, accept `avgRating` prop |
| `src/components/trending/TrendingCard.tsx` | Remove per-card rating fetch, accept `avgRating` prop |
| `src/pages/HomeFeed.tsx` | Add react-query, select specific columns, batch-fetch ratings |
| `src/pages/Trending.tsx` | Add react-query, select specific columns, batch-fetch ratings, reduce max_results |
| `src/components/feed/FeedSidebar.tsx` | Wrap in useQuery with staleTime |
| `src/components/trending/TrendingSidebar.tsx` | Wrap in useQuery with staleTime |

## Expected Impact
- **Perceived load time**: ~60-70% faster (caching eliminates reload on back-nav)
- **Network requests per page**: from ~25+ down to ~3-4
- **Payload size**: ~50% smaller per feed load

