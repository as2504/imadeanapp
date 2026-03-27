
-- Add slug column to apps
ALTER TABLE public.apps ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- Create follows table
CREATE TABLE public.follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL,
  following_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Follows are viewable by everyone" ON public.follows FOR SELECT TO public USING (true);
CREATE POLICY "Users can follow" ON public.follows FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON public.follows FOR DELETE TO authenticated USING (auth.uid() = follower_id);

-- Slug generation trigger function
CREATE OR REPLACE FUNCTION public.generate_app_slug()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE base_slug text; final_slug text; counter int := 0;
BEGIN
  base_slug := lower(regexp_replace(trim(NEW.app_name), '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  final_slug := base_slug;
  LOOP
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.apps WHERE slug = final_slug AND id != NEW.id);
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  NEW.slug := final_slug;
  RETURN NEW;
END; $$;

CREATE TRIGGER set_app_slug BEFORE INSERT OR UPDATE OF app_name ON public.apps
FOR EACH ROW EXECUTE FUNCTION public.generate_app_slug();

-- Populate slugs for existing apps
UPDATE public.apps SET app_name = app_name WHERE slug IS NULL;
