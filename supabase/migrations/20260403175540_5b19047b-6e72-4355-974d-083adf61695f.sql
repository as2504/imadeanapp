
CREATE TABLE public.app_feedback_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid NOT NULL UNIQUE,
  user_id uuid NOT NULL,
  feedback_type text NOT NULL DEFAULT 'qna',
  is_enabled boolean NOT NULL DEFAULT true,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_feedback_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Feedback config viewable by everyone"
ON public.app_feedback_config FOR SELECT TO public USING (true);

CREATE POLICY "Users can insert own feedback config"
ON public.app_feedback_config FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own feedback config"
ON public.app_feedback_config FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own feedback config"
ON public.app_feedback_config FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE TABLE public.app_feedback_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid NOT NULL,
  config_id uuid NOT NULL,
  user_id uuid NOT NULL,
  response_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  feedback_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_feedback_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Responses viewable by app owner"
ON public.app_feedback_responses FOR SELECT TO authenticated
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.app_feedback_config fc
    WHERE fc.id = config_id AND fc.user_id = auth.uid()
  )
);

CREATE POLICY "Users can submit responses"
ON public.app_feedback_responses FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);
