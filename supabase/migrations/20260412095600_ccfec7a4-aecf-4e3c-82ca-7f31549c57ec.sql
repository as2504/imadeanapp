
CREATE TABLE public.profile_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  viewer_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, viewer_id)
);

ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profile views viewable by everyone"
ON public.profile_views
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert profile views"
ON public.profile_views
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = viewer_id);
