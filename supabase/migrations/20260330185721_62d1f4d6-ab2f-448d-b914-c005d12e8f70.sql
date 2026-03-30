ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS work_experience jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.apps ADD COLUMN IF NOT EXISTS unpublish_reason text;