# Plan: Search Bar Alignment, Feed Tab Dropdown, Mobile Sidebar Fix

## Summary

Three fixes: (1) align the navbar search bar with the primary content column, (2) convert feed tabs into a dropdown selector, (3) fix mobile sidebar panels not showing content.

---

## 1. Fix Mobile Sidebar — Content Not Visible

**Root cause:** Both `FeedSidebar` and `TrendingSidebar` have `className="hidden lg:block ..."` on their root `<aside>` element. When rendered inside `SidebarPanel` on mobile, they remain hidden because of their own `hidden lg:block` class.

**Fix:** Remove `hidden lg:block` and the outer `<aside>` wrapper from both components. Make them plain `<div>` containers. The show/hide logic is already handled by `FeedLayout` (desktop `<aside>`) and `SidebarPanel` (mobile drawer).

**Files:** `src/components/feed/FeedSidebar.tsx`, `src/components/trending/TrendingSidebar.tsx`

---

## 2. Align Search Bar with Primary Content Column

**Current:** Search bar is centered in the full-width navbar using `flex-1 max-w-md mx-8`.

**Fix:** Constrain the navbar inner container to the same `max-w-[1080px]` used by `FeedLayout`. This ensures the search bar visually aligns with the feed content below it.

**File:** `src/components/feed/FeedNavbar.tsx` — change `container mx-auto` to `max-w-[1080px] mx-auto`

---

## 3. Convert Feed Tabs to Dropdown Menu

**Current:** "For You", "Following", "Trending", "New" rendered as inline tab buttons.

**Change:** Replace with a dropdown button showing the active selection + a `ChevronDown` icon. Clicking opens a dropdown menu with the options. Selecting one updates the active tab and closes the menu.

Same approach for `TrendingFilters` — convert "Today", "This Week", "This Month", "All Time" into a dropdown.

**Files:** `src/components/feed/FeedFilters.tsx`, `src/components/trending/TrendingFilters.tsx`

**Layout after change:**

```
[For You ▾]  [sidebar arrow]
[All] [Web Apps] [Mobile Apps] [AI Tools] ...
```

---

## Files to Edit


| File                                          | Change                                         |
| --------------------------------------------- | ---------------------------------------------- |
| `src/components/feed/FeedSidebar.tsx`         | Remove `hidden lg:block` and `<aside>` wrapper |
| `src/components/trending/TrendingSidebar.tsx` | Remove `hidden lg:block` and `<aside>` wrapper |
| `src/components/feed/FeedNavbar.tsx`          | Align navbar container to `max-w-[1080px]`     |
| `src/components/feed/FeedFilters.tsx`         | Convert tabs to dropdown menu                  |
| `src/components/trending/TrendingFilters.tsx` | Convert time filters to dropdown menu          |
