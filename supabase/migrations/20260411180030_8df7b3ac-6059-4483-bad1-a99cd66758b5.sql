CREATE TABLE public.user_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  terms_version text NOT NULL DEFAULT '1.0',
  privacy_version text NOT NULL DEFAULT '1.0',
  consented_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own consent" ON public.user_consents FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own consent" ON public.user_consents FOR SELECT TO authenticated USING (auth.uid() = user_id);