-- Add app_updates table and update reason to apps
CREATE TABLE public.app_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  app_id UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  version_notes TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add unpublish_reason to apps
ALTER TABLE public.apps ADD COLUMN IF NOT EXISTS unpublish_reason TEXT;

-- Enable RLS
ALTER TABLE public.app_updates ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "App updates are viewable by everyone"
  ON public.app_updates FOR SELECT USING (true);

CREATE POLICY "Users can insert their own app updates"
  ON public.app_updates FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT user_id FROM public.apps WHERE id = app_id)
  );
