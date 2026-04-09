
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS linkedin_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS portfolio_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS instagram_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS leetcode_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS date_of_birth date;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS professional_title text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS education jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS work_experience jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS work_experience_years integer;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS primary_skill text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS secondary_tools text[] DEFAULT '{}'::text[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_platforms text[] DEFAULT '{}'::text[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS looking_for_work boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS open_to_collaboration boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS collaboration_looking_for text[] DEFAULT '{}'::text[];
