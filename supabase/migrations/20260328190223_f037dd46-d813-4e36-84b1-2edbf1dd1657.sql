
-- Create app_updates table
CREATE TABLE public.app_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  version_notes text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "App updates are viewable by everyone" ON public.app_updates FOR SELECT TO public USING (true);
CREATE POLICY "Users can insert their own updates" ON public.app_updates FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Create increment_views RPC
CREATE OR REPLACE FUNCTION public.increment_views(app_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.apps SET views_count = COALESCE(views_count, 0) + 1 WHERE id = app_id;
$$;
