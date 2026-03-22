

# Plan: Layout Consistency & Mobile Sidebar Panel

## Summary

Standardize the two-column layout across Home and Trending pages, remove the Trending header text, align filter positioning, and add a mobile slide-in panel for the secondary sidebar content.

## 1. Create Shared Layout Wrapper

Create `src/components/layout/FeedLayout.tsx` — a reusable two-column layout component used by both Home and Trending pages.

- Desktop: primary column (~70%, max-width ~720px) on left, sidebar (~280px) on right, centered in a max-width container (~1080px)
- Mobile: full-width primary column only, with a slide-in panel for sidebar content
- Accepts `sidebar` as a React node prop and `children` for the primary column

## 2. Mobile Sidebar Panel

Create `src/components/layout/SidebarPanel.tsx` — a slide-in panel component for mobile.

- Triggered by a left-arrow icon (`ChevronLeft`) placed inline with the filter tabs row
- Slides in from the right covering 80% of screen width
- Remaining 20% is a dark overlay — tapping it closes the panel
- X button at top-right of the panel to close
- Renders the sidebar content passed as children
- Uses CSS transitions for smooth slide animation

## 3. Update FeedFilters & TrendingFilters

- Both filter components accept an optional `onOpenSidebar` callback prop
- On mobile, render a `ChevronLeft` arrow button at the end of the tabs row (same line as "For You"/"Today" tabs)
- Clicking it triggers the sidebar panel open

## 4. Update Trending Page

- Remove the "Trending Apps" heading and subtitle entirely
- Use the shared `FeedLayout` wrapper
- Filters and content align to the same positions as Home page

## 5. Update Home Page

- Use the shared `FeedLayout` wrapper
- Same container, same column widths as Trending

## 6. Profile Page

- Already centered with `max-w-4xl` — keep as-is (no sidebar needed)
- No changes required

## Files to Create/Edit

| File | Action |
|---|---|
| `src/components/layout/FeedLayout.tsx` | Create — shared two-column layout |
| `src/components/layout/SidebarPanel.tsx` | Create — mobile slide-in panel |
| `src/components/feed/FeedFilters.tsx` | Edit — add mobile arrow trigger |
| `src/components/trending/TrendingFilters.tsx` | Edit — add mobile arrow trigger |
| `src/pages/HomeFeed.tsx` | Edit — use FeedLayout, remove inline flex layout |
| `src/pages/Trending.tsx` | Edit — remove header, use FeedLayout |

## Technical Details

- Layout container: `max-w-[1080px] mx-auto px-4 lg:px-6`
- Primary column: `flex-1 max-w-[720px]`
- Sidebar: `w-[280px] shrink-0 sticky top-20` (hidden on `<lg`, shown on `lg+`)
- Gap between columns: `gap-8`
- Mobile panel: fixed positioning, `right-0`, `w-[80vw]`, backdrop with `bg-black/20`, `z-50`, transition `transform 300ms ease`
- Arrow icon visible only on `lg:hidden` screens, placed at the right end of the tabs row

