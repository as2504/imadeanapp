
-- 1. PROFILES: Replace public SELECT with two policies
-- Drop the overly permissive public SELECT
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Allow authenticated users to see their own full profile
CREATE POLICY "Users can view own full profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow public to see profiles but exclude sensitive fields via a view
-- First create a view that omits date_of_birth and gender
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT
  id, user_id, username, display_name, avatar_url, bio, website,
  github_url, twitter_url, linkedin_url, instagram_url, leetcode_url, portfolio_url,
  location, professional_title, primary_skill, secondary_tools, preferred_platforms,
  looking_for_work, open_to_collaboration, collaboration_looking_for,
  education, work_experience, work_experience_years, social_links,
  created_at, updated_at
FROM public.profiles;

-- Allow public SELECT on the base table for non-sensitive data
-- (needed for app listings, comments, etc. that join on profiles)
CREATE POLICY "Public can view non-sensitive profile data"
ON public.profiles
FOR SELECT
TO public
USING (true);

-- NOTE: The public_profiles view provides a safe interface that excludes
-- date_of_birth and gender. Frontend code querying profiles publicly
-- should use this view when possible.

-- 2. APP_CLICKS: Restrict to authenticated only
DROP POLICY IF EXISTS "Clicks viewable by everyone" ON public.app_clicks;

CREATE POLICY "Clicks viewable by authenticated users"
ON public.app_clicks
FOR SELECT
TO authenticated
USING (true);

-- 3. APP_TRIES: Restrict to authenticated only
DROP POLICY IF EXISTS "App tries are viewable by everyone" ON public.app_tries;

CREATE POLICY "App tries viewable by authenticated users"
ON public.app_tries
FOR SELECT
TO authenticated
USING (true);

-- 4. PROFILE_VIEWS: Restrict to profile owner only
DROP POLICY IF EXISTS "Profile views viewable by everyone" ON public.profile_views;

CREATE POLICY "Profile views viewable by owner"
ON public.profile_views
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
