CREATE TABLE IF NOT EXISTS public.ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ratings_app_id_idx ON public.ratings (app_id);
CREATE INDEX IF NOT EXISTS ratings_user_id_idx ON public.ratings (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS ratings_app_id_user_id_key ON public.ratings (app_id, user_id);

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'ratings'
      AND policyname = 'Ratings are viewable by everyone'
  ) THEN
    EXECUTE 'CREATE POLICY "Ratings are viewable by everyone" ON public.ratings FOR SELECT TO public USING (true)';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'ratings'
      AND policyname = 'Users can insert their own ratings'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can insert their own ratings" ON public.ratings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'ratings'
      AND policyname = 'Users can update their own ratings'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can update their own ratings" ON public.ratings FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'ratings'
      AND policyname = 'Users can delete their own ratings'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can delete their own ratings" ON public.ratings FOR DELETE TO authenticated USING (auth.uid() = user_id)';
  END IF;
END
$$;
