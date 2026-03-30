

# Plan: Fix Profile Edit, Unpublish, Drafts Tab, Navbar Contrast

## 1. Fix EditProfile.tsx — `work_experience` column error

**Problem:** The DB column is `work_experience_years` (integer), not `work_experience` (jsonb). The code reads/writes `work_experience` which doesn't exist.

**Database migration:** Add a `work_experience` jsonb column to profiles:
```sql
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS work_experience jsonb DEFAULT '[]'::jsonb;
```

**TypeScript fix (line 42):** Fix the build error — `preferred_platforms` (snake_case) should be `preferredPlatforms` (camelCase) to match the state interface:
```ts
setDevelopment({ ..., preferredPlatforms: data.preferred_platforms || [], ... });
```

## 2. Fix Unpublish — `unpublish_reason` column missing

**Problem:** `ProfilePublishedApps.tsx` line 134 writes `unpublish_reason` to `apps` table, but that column doesn't exist.

**Two fixes:**
- **Database migration:** Add `unpublish_reason text` column to `apps` table.
- **Code fix (line 134):** Change status from `"unpublished"` to `"draft"` so unpublished apps go to drafts.
- **Toast message (line 141):** Update to "Your app has been moved to drafts."

## 3. Add "Drafts" tab to Profile page

**`Profile.tsx`:**
- Add `"Drafts"` to tabs array (between "Saved Apps" and "Activity"), only visible for own profile.
- Render a new `ProfileDraftApps` component when active.
- **Mobile:** Convert tab bar to a dropdown (`Select`) on small screens using `use-mobile` hook. Show current tab label with a down arrow; selecting changes tab.

**New `ProfileDraftApps.tsx`:**
- Query `apps` where `user_id = targetUserId` and `status IN ('draft', 'unpublished')` (user can see own drafts via existing RLS).
- Render as list with app name, status badge, "Edit" and "Publish" actions.

## 4. Navbar contrast — darker in dark mode, off-white in light

**`FeedNavbar.tsx` (line 29):** Change navbar bg from `bg-background/80` to `bg-[#010409]/90` for a noticeably darker navbar than the page background (`#0D1117`).

**`src/index.css`:** Since we're dark-only, just update the navbar class. If light mode support exists via ThemeProvider, also add a light variant: `bg-[#f6f8fa]/90`.

**Simpler approach:** Use a CSS variable `--navbar` set to `#010409` in `:root`, and reference `bg-[hsl(var(--navbar))]` in the component.

Also update landing `Navbar.tsx` to match.

---

## Files Summary

| File | Change |
|---|---|
| **Migration SQL** | Add `work_experience jsonb` to profiles, `unpublish_reason text` to apps |
| `src/pages/EditProfile.tsx` | Fix `preferred_platforms` → `preferredPlatforms` (line 42) |
| `src/components/profile/ProfilePublishedApps.tsx` | Change unpublish status to `"draft"`, update toast |
| `src/pages/Profile.tsx` | Add Drafts tab, mobile dropdown tabs |
| `src/components/profile/ProfileDraftApps.tsx` | **New** — list draft/unpublished apps |
| `src/components/feed/FeedNavbar.tsx` | Darker navbar bg |
| `src/components/landing/Navbar.tsx` | Match navbar contrast |
| `src/index.css` | Add `--navbar` token |

