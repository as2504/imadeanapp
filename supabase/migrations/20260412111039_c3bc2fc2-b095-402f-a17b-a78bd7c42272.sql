-- Create ratings table if not exists
CREATE TABLE IF NOT EXISTS public.ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  rating integer NOT NULL,
  review_text text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Unique constraint (safe: ignore if exists)
DO $$ BEGIN
  ALTER TABLE public.ratings ADD CONSTRAINT ratings_app_user_unique UNIQUE (app_id, user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ratings_app_id ON public.ratings(app_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON public.ratings(user_id);

-- Enable RLS
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies to avoid conflicts
DROP POLICY IF EXISTS "Ratings are viewable by everyone" ON public.ratings;
CREATE POLICY "Ratings are viewable by everyone" ON public.ratings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own ratings" ON public.ratings;
CREATE POLICY "Users can insert their own ratings" ON public.ratings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own ratings" ON public.ratings;
CREATE POLICY "Users can update their own ratings" ON public.ratings FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own ratings" ON public.ratings;
CREATE POLICY "Users can delete their own ratings" ON public.ratings FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Validation trigger
CREATE OR REPLACE FUNCTION public.validate_rating_value()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.rating < 1 OR NEW.rating > 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS check_rating_value ON public.ratings;
CREATE TRIGGER check_rating_value
BEFORE INSERT OR UPDATE ON public.ratings
FOR EACH ROW EXECUTE FUNCTION public.validate_rating_value();