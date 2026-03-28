-- Create a function to increment views count safely
CREATE OR REPLACE FUNCTION public.increment_views(app_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.apps
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = app_id;
END;
$$;
