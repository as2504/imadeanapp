
-- 1. Create ratings table if not exists
CREATE TABLE IF NOT EXISTS public.ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(app_id, user_id)
);

-- Enable RLS for ratings
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Policies for ratings
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ratings' AND policyname = 'Ratings are viewable by everyone') THEN
        CREATE POLICY "Ratings are viewable by everyone" ON public.ratings FOR SELECT TO public USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ratings' AND policyname = 'Users can insert their own ratings') THEN
        CREATE POLICY "Users can insert their own ratings" ON public.ratings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ratings' AND policyname = 'Users can update their own ratings') THEN
        CREATE POLICY "Users can update their own ratings" ON public.ratings FOR UPDATE TO authenticated USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ratings' AND policyname = 'Users can delete their own ratings') THEN
        CREATE POLICY "Users can delete their own ratings" ON public.ratings FOR DELETE TO authenticated USING (auth.uid() = user_id);
    END IF;
END
$$;

-- 2. Create app_tries table if not exists
CREATE TABLE IF NOT EXISTS public.app_tries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(app_id, user_id)
);

-- Enable RLS for app_tries
ALTER TABLE public.app_tries ENABLE ROW LEVEL SECURITY;

-- Policies for app_tries
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'app_tries' AND policyname = 'App tries are viewable by everyone') THEN
        CREATE POLICY "App tries are viewable by everyone" ON public.app_tries FOR SELECT TO public USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'app_tries' AND policyname = 'Users can insert their own tries') THEN
        CREATE POLICY "Users can insert their own tries" ON public.app_tries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
    END IF;
END
$$;
