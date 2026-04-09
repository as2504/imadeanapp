

# Plan: Fix Social Links Saving & Add Missing Profile Migration

## Problem 1: Social Links Not Saving

**Root cause:** Case mismatch between `EditProfileLinks` platform IDs (`"github"`, `"twitter"`, `"linkedin"`, `"website"`) and `EditProfile.tsx`'s `socialPlatformToColumn` keys (`"GitHub"`, `"Twitter"`, `"LinkedIn"`, `"Website"`).

When loading from DB, `columnToPlatform` maps `github_url` → `"GitHub"`, so links get capitalized platform names. But `EditProfileLinks` creates new links with lowercase IDs like `"github"`. When saving, `socialPlatformToColumn["github"]` returns `undefined`, so the URL never gets written to any column.

**Fix in `EditProfile.tsx`:** Change `socialPlatformToColumn` keys to lowercase to match `EditProfileLinks` platform IDs:

```
github → github_url
twitter → twitter_url
linkedin → linkedin_url
website → website
portfolio → portfolio_url
instagram → instagram_url
leetcode → leetcode_url
```

And update `columnToPlatform` accordingly.

## Problem 2: Missing Profile Columns Migration

The `profiles` table was created with only: `username, display_name, avatar_url, bio, website, github_url, twitter_url`. Later, many columns were added directly to Lovable's test Supabase but **no migration file exists** for them. When you run `supabase db push` on prod, these columns are missing.

**Missing columns (need a new migration):**

- `linkedin_url text`
- `portfolio_url text`
- `instagram_url text`
- `leetcode_url text`
- `social_links jsonb DEFAULT '[]'`
- `gender text`
- `location text`
- `date_of_birth date`
- `professional_title text`
- `education jsonb DEFAULT '[]'`
- `work_experience_years integer`
- `primary_skill text`
- `secondary_tools text[] DEFAULT '{}'`
- `preferred_platforms text[] DEFAULT '{}'`
- `looking_for_work boolean DEFAULT false`
- `open_to_collaboration boolean DEFAULT false`
- `collaboration_looking_for text[] DEFAULT '{}'`

**Fix:** Create a single migration file that adds all missing columns using `ADD COLUMN IF NOT EXISTS`.

## Problem 3: Environment Variable Portability

Currently `.env` is committed with Lovable's test Supabase keys. You mentioned the `.env` should be in `.gitignore` going forward.

**Fix:**
- Verify `.env` is in `.gitignore` (it should be already based on your setup)
- No code changes needed — the app already reads from `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` env vars, which you set in Vercel for prod

---

## Files Summary

| File | Change |
|---|---|
| `src/pages/EditProfile.tsx` | Fix `socialPlatformToColumn` keys to lowercase |
| `supabase/migrations/2026XXXX_add_missing_profile_columns.sql` | **New** — adds all missing `profiles` columns |

