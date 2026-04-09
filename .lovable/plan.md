

# Plan: Trending Algorithm, Landing Page Update, README

## 1. Database Migration — `app_clicks` table + RPC function

**New table: `app_clicks`** — tracks unique outbound "Try App" clicks per user per app.

```sql
CREATE TABLE public.app_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(app_id, user_id)
);
ALTER TABLE public.app_clicks ENABLE ROW LEVEL SECURITY;
-- RLS: public read, authenticated insert own
CREATE POLICY "Clicks viewable by everyone" ON public.app_clicks FOR SELECT TO public USING (true);
CREATE POLICY "Users can insert own clicks" ON public.app_clicks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
```

**New RPC function: `get_trending_apps`** — calculates trending score server-side:

```sql
CREATE OR REPLACE FUNCTION public.get_trending_apps(time_filter text DEFAULT 'week', max_results int DEFAULT 30)
RETURNS TABLE (
  app_id uuid, trending_score float, engagement_score float,
  avg_rating float, tries_count bigint, feedback_count bigint,
  reviews_count bigint, saves_count bigint, review_likes_count bigint, ratings_count bigint
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  WITH app_stats AS (
    SELECT a.id AS aid,
      a.created_at,
      COALESCE((SELECT COUNT(DISTINCT user_id) FROM app_clicks WHERE app_id = a.id), 0) AS tries,
      COALESCE((SELECT COUNT(DISTINCT user_id) FROM app_feedback_responses WHERE app_id = a.id), 0) AS feedback,
      COALESCE((SELECT COUNT(*) FROM ratings WHERE app_id = a.id), 0) AS reviews,
      COALESCE((SELECT COUNT(DISTINCT user_id) FROM saved_apps WHERE app_id = a.id), 0) AS saves,
      COALESCE((SELECT SUM(COALESCE(c.likes_count, 0)) FROM comments c WHERE c.app_id = a.id), 0) AS rev_likes,
      COALESCE((SELECT COUNT(*) FROM ratings WHERE app_id = a.id), 0) AS rating_ct,
      COALESCE((SELECT AVG(rating)::float FROM ratings WHERE app_id = a.id), 0) AS avg_rat
    FROM apps a
    WHERE a.status = 'published'
      AND (time_filter = 'all'
        OR (time_filter = 'today' AND a.created_at >= CURRENT_DATE)
        OR (time_filter = 'week' AND a.created_at >= NOW() - INTERVAL '7 days')
        OR (time_filter = 'month' AND a.created_at >= NOW() - INTERVAL '30 days'))
  )
  SELECT aid, 
    CASE WHEN avg_rat > 0 THEN
      ((tries*15 + feedback*10 + reviews*5 + saves*4 + rev_likes*2 + rating_ct*1) * GREATEST(avg_rat, 1))
        / POWER(EXTRACT(EPOCH FROM (NOW() - created_at))/3600.0 + 2, 1.5)
    ELSE
      (tries*15 + feedback*10 + reviews*5 + saves*4 + rev_likes*2 + rating_ct*1)::float
        / POWER(EXTRACT(EPOCH FROM (NOW() - created_at))/3600.0 + 2, 1.5)
    END,
    (tries*15 + feedback*10 + reviews*5 + saves*4 + rev_likes*2 + rating_ct*1)::float,
    avg_rat, tries, feedback, reviews, saves, rev_likes, rating_ct
  FROM app_stats
  ORDER BY 2 DESC
  LIMIT max_results;
$$;
```

This reuses existing tables (`saved_apps`, `ratings`, `comments`, `app_feedback_responses`) and adds only `app_clicks`. The `app_tries` table already exists but is used for feedback gating — `app_clicks` is the dedicated outbound-click tracker with a unique constraint.

## 2. Frontend — Trending Page Uses RPC

**`src/pages/Trending.tsx`:** Replace the current `views_count` ORDER BY with calling `supabase.rpc('get_trending_apps', { time_filter, max_results: 20 })`, then fetch app details + profiles for the returned IDs. Pass `trending_score` to each card.

**`src/components/trending/TrendingCard.tsx`:** Add optional `trendingScore` display (small badge showing score).

## 3. Frontend — HomeFeed Default Sort

**`src/pages/HomeFeed.tsx`:** When sort is empty and feed is "for-you", call the same `get_trending_apps` RPC to get app IDs in trending order, then fetch full app data in that order. Other filters (following, most recent, etc.) keep current behavior.

## 4. Track Outbound Clicks

**`src/pages/AppDetail.tsx` — `handleTryApp`:** In addition to inserting into `app_tries`, also insert into `app_clicks` (with `ON CONFLICT DO NOTHING` semantics via `.upsert` or catching the unique violation). This ensures one click per user per app.

```typescript
// In handleTryApp:
if (user && appData) {
  await supabase.from("app_clicks").upsert(
    { app_id: appData.id, user_id: user.id },
    { onConflict: "app_id,user_id" }
  );
}
```

## 5. Landing Page Update

**`src/components/landing/FeaturesSection.tsx`:** Add two missing feature cards:
- **Community Feedback** (MessageSquare icon) — "Get structured feedback from real users with custom QnA and satisfaction surveys." Bullets: "Custom questionnaires", "Satisfaction tracking", "Publisher analytics dashboard"
- **Trending Algorithm** (TrendingUp icon) — "A gravity-based algorithm ranks apps by real engagement, not vanity metrics." Bullets: "Weighted engagement scoring", "Time-decay ranking", "Anti-gaming unique constraints"

Update existing cards' descriptions to reflect current features more accurately (e.g., mention Google sign-in, app feedback).

**`src/pages/Index.tsx`:** Add a "How It Works" section between Features and CTA with 3 steps: Publish → Get Discovered → Grow.

## 6. README.md

Replace with a proper project README including: project name/description, features list, tech stack, local development setup, environment variables needed, database migration instructions, deployment notes.

## 7. Existing Tables Used (No Changes Needed)

- `saved_apps` — already has unique behavior (one save per user per app via RLS)
- `ratings` — tracks ratings count and values
- `comments.likes_count` — tracks review likes
- `app_feedback_responses` — tracks unique feedback per user

---

## Files Summary

| File | Change |
|---|---|
| **Migration SQL** | Create `app_clicks` table + `get_trending_apps` RPC function |
| `src/pages/Trending.tsx` | Use `get_trending_apps` RPC instead of `views_count` sort |
| `src/pages/HomeFeed.tsx` | Default "For You" uses trending RPC |
| `src/pages/AppDetail.tsx` | Insert into `app_clicks` on "Try App" click |
| `src/components/landing/FeaturesSection.tsx` | Add Feedback + Trending feature cards |
| `src/pages/Index.tsx` | Add "How It Works" section |
| `README.md` | Full project documentation |

