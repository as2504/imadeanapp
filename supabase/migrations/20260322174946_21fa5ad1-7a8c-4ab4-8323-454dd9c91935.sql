
-- Comments table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  text TEXT NOT NULL,
  likes_count INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Everyone can read comments
CREATE POLICY "Comments are viewable by everyone"
  ON public.comments FOR SELECT
  TO public
  USING (true);

-- Authenticated users can insert their own comments
CREATE POLICY "Users can insert their own comments"
  ON public.comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
  ON public.comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Storage policies for app-assets bucket
CREATE POLICY "Authenticated users can upload app assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'app-assets');

CREATE POLICY "Anyone can view app assets"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'app-assets');

CREATE POLICY "Users can update their own app assets"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'app-assets' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own app assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'app-assets' AND (storage.foldername(name))[1] = auth.uid()::text);
