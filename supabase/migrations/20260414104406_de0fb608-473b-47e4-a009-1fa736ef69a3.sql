
-- Fix the view to use SECURITY INVOKER (safe - respects caller's RLS)
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles
WITH (security_invoker = true)
AS
SELECT
  id, user_id, username, display_name, avatar_url, bio, website,
  github_url, twitter_url, linkedin_url, instagram_url, leetcode_url, portfolio_url,
  location, professional_title, primary_skill, secondary_tools, preferred_platforms,
  looking_for_work, open_to_collaboration, collaboration_looking_for,
  education, work_experience, work_experience_years, social_links,
  created_at, updated_at
FROM public.profiles;
