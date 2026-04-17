-- 1. Add columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS referrals_count integer NOT NULL DEFAULT 0;

-- 2. Function to generate an 8-char referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code text;
  attempt int := 0;
BEGIN
  LOOP
    code := '';
    FOR i IN 1..8 LOOP
      code := code || substr(chars, (floor(random() * length(chars))::int) + 1, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = code);
    attempt := attempt + 1;
    IF attempt > 10 THEN EXIT; END IF;
  END LOOP;
  RETURN code;
END;
$$;

-- 3. Backfill existing profiles
UPDATE public.profiles SET referral_code = public.generate_referral_code() WHERE referral_code IS NULL;

-- 4. Trigger to auto-assign code on insert
CREATE OR REPLACE FUNCTION public.set_referral_code()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := public.generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_referral_code ON public.profiles;
CREATE TRIGGER trg_set_referral_code
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_referral_code();

-- 5. Referrals table
CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_user_id uuid,
  referral_code text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  qualified_at timestamptz,
  CONSTRAINT referrals_status_check CHECK (status IN ('pending','signed_up','qualified')),
  CONSTRAINT referrals_unique_referred UNIQUE (referred_user_id)
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON public.referrals(referred_user_id);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view referrals they're part of"
  ON public.referrals FOR SELECT
  TO authenticated
  USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);

CREATE POLICY "Authenticated users can create referrals"
  ON public.referrals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = referred_user_id);

-- 6. Trigger on apps insert/update: when an app is published, qualify any pending referral
CREATE OR REPLACE FUNCTION public.qualify_referral_on_publish()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ref_row public.referrals%ROWTYPE;
  new_count int;
BEGIN
  IF NEW.status <> 'published' THEN
    RETURN NEW;
  END IF;

  -- Find pending/signed_up referral for this user
  SELECT * INTO ref_row FROM public.referrals
    WHERE referred_user_id = NEW.user_id AND status <> 'qualified'
    LIMIT 1;

  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  UPDATE public.referrals
    SET status = 'qualified', qualified_at = now()
    WHERE id = ref_row.id;

  UPDATE public.profiles
    SET referrals_count = referrals_count + 1
    WHERE user_id = ref_row.referrer_id
    RETURNING referrals_count INTO new_count;

  IF new_count >= 3 THEN
    UPDATE public.profiles SET is_verified = true WHERE user_id = ref_row.referrer_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_qualify_referral_insert ON public.apps;
CREATE TRIGGER trg_qualify_referral_insert
  AFTER INSERT ON public.apps
  FOR EACH ROW
  WHEN (NEW.status = 'published')
  EXECUTE FUNCTION public.qualify_referral_on_publish();

DROP TRIGGER IF EXISTS trg_qualify_referral_update ON public.apps;
CREATE TRIGGER trg_qualify_referral_update
  AFTER UPDATE OF status ON public.apps
  FOR EACH ROW
  WHEN (OLD.status <> 'published' AND NEW.status = 'published')
  EXECUTE FUNCTION public.qualify_referral_on_publish();