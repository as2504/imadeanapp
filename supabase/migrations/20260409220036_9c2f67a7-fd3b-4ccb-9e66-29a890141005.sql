
-- 1. Create app_clicks table
CREATE TABLE public.app_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(app_id, user_id)
);

ALTER TABLE public.app_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clicks viewable by everyone" ON public.app_clicks FOR SELECT TO public USING (true);
CREATE POLICY "Users can insert own clicks" ON public.app_clicks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 2. Create get_trending_apps RPC function
CREATE OR REPLACE FUNCTION public.get_trending_apps(time_filter text DEFAULT 'week', max_results int DEFAULT 30)
RETURNS TABLE (
  app_id uuid,
  trending_score float,
  engagement_score float,
  avg_rating float,
  tries_count bigint,
  feedback_count bigint,
  reviews_count bigint,
  saves_count bigint,
  review_likes_count bigint,
  ratings_count bigint
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  WITH app_stats AS (
    SELECT
      a.id AS aid,
      a.created_at,
      COALESCE((SELECT COUNT(DISTINCT user_id) FROM app_clicks WHERE app_clicks.app_id = a.id), 0) AS tries,
      COALESCE((SELECT COUNT(DISTINCT user_id) FROM app_feedback_responses WHERE app_feedback_responses.app_id = a.id), 0) AS feedback,
      COALESCE((SELECT COUNT(*) FROM ratings WHERE ratings.app_id = a.id), 0) AS reviews,
      COALESCE((SELECT COUNT(DISTINCT user_id) FROM saved_apps WHERE saved_apps.app_id = a.id), 0) AS saves,
      COALESCE((SELECT SUM(COALESCE(c.likes_count, 0)) FROM comments c WHERE c.app_id = a.id), 0) AS rev_likes,
      COALESCE((SELECT COUNT(*) FROM ratings r2 WHERE r2.app_id = a.id), 0) AS rating_ct,
      COALESCE((SELECT AVG(r3.rating)::float FROM ratings r3 WHERE r3.app_id = a.id), 0) AS avg_rat
    FROM apps a
    WHERE a.status = 'published'
      AND (
        time_filter = 'all'
        OR (time_filter = 'today' AND a.created_at >= CURRENT_DATE)
        OR (time_filter = 'week' AND a.created_at >= NOW() - INTERVAL '7 days')
        OR (time_filter = 'month' AND a.created_at >= NOW() - INTERVAL '30 days')
      )
  )
  SELECT
    aid,
    CASE WHEN avg_rat > 0 THEN
      ((tries*15 + feedback*10 + reviews*5 + saves*4 + rev_likes*2 + rating_ct*1) * GREATEST(avg_rat, 1))
        / POWER(EXTRACT(EPOCH FROM (NOW() - created_at))/3600.0 + 2, 1.5)
    ELSE
      (tries*15 + feedback*10 + reviews*5 + saves*4 + rev_likes*2 + rating_ct*1)::float
        / POWER(EXTRACT(EPOCH FROM (NOW() - created_at))/3600.0 + 2, 1.5)
    END,
    (tries*15 + feedback*10 + reviews*5 + saves*4 + rev_likes*2 + rating_ct*1)::float,
    avg_rat,
    tries,
    feedback,
    reviews,
    saves,
    rev_likes,
    rating_ct
  FROM app_stats
  ORDER BY 2 DESC
  LIMIT max_results;
$$;
