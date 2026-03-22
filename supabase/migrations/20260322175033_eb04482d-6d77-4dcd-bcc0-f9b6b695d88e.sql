
-- Drop FK constraints that reference auth.users so we can seed dummy data
-- profiles table
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;
