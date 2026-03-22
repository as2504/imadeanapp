-- Apps table
CREATE TABLE public.apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  app_name TEXT NOT NULL,
  tagline TEXT,
  short_description TEXT,
  full_description TEXT,
  app_icon_url TEXT,
  tags TEXT[] DEFAULT '{}',
  tech_stack TEXT[] DEFAULT '{}',
  platforms TEXT[] DEFAULT '{}',
  website_url TEXT,
  play_store_url TEXT,
  app_store_url TEXT,
  github_url TEXT,
  demo_video_url TEXT,
  pricing TEXT DEFAULT 'free',
  caption TEXT,
  screenshots TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  views_count INT DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;

-- Everyone can view published apps
CREATE POLICY "Published apps are viewable by everyone"
ON public.apps FOR SELECT
TO public
USING (status = 'published');

-- Owners can view their own apps (including drafts)
CREATE POLICY "Users can view their own apps"
ON public.apps FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Owners can insert their own apps
CREATE POLICY "Users can insert their own apps"
ON public.apps FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Owners can update their own apps
CREATE POLICY "Users can update their own apps"
ON public.apps FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Owners can delete their own apps
CREATE POLICY "Users can delete their own apps"
ON public.apps FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Reuse updated_at trigger
CREATE TRIGGER update_apps_updated_at
  BEFORE UPDATE ON public.apps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for app assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('app-assets', 'app-assets', true);

-- Storage RLS: anyone can view
CREATE POLICY "Public read access for app-assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'app-assets');

-- Storage RLS: authenticated users can upload
CREATE POLICY "Authenticated users can upload app-assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'app-assets');

-- Storage RLS: users can update their own uploads
CREATE POLICY "Users can update their own app-assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'app-assets' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Storage RLS: users can delete their own uploads
CREATE POLICY "Users can delete their own app-assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'app-assets' AND (storage.foldername(name))[1] = auth.uid()::text);