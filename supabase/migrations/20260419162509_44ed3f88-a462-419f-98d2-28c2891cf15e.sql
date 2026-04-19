-- 1. Add new columns to apps
ALTER TABLE public.apps
  ADD COLUMN IF NOT EXISTS upvotes_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS notify_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS planned_launch text;

-- 2. Update RLS so 'upcoming' apps are publicly viewable
DROP POLICY IF EXISTS "Published apps are viewable by everyone" ON public.apps;
CREATE POLICY "Published and upcoming apps are viewable by everyone"
  ON public.apps FOR SELECT
  TO public
  USING (status IN ('published', 'upcoming'));

-- 3. idea_upvotes table
CREATE TABLE public.idea_upvotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (app_id, user_id)
);
CREATE INDEX idx_idea_upvotes_app ON public.idea_upvotes(app_id);
CREATE INDEX idx_idea_upvotes_user ON public.idea_upvotes(user_id);

ALTER TABLE public.idea_upvotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Upvotes viewable by everyone"
  ON public.idea_upvotes FOR SELECT TO public USING (true);
CREATE POLICY "Users can upvote"
  ON public.idea_upvotes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own upvote"
  ON public.idea_upvotes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 4. idea_notify_subscriptions table
CREATE TABLE public.idea_notify_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  notified_at timestamptz,
  UNIQUE (app_id, user_id)
);
CREATE INDEX idx_notify_subs_app ON public.idea_notify_subscriptions(app_id);
CREATE INDEX idx_notify_subs_user ON public.idea_notify_subscriptions(user_id);

ALTER TABLE public.idea_notify_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Notify subs counts viewable by everyone"
  ON public.idea_notify_subscriptions FOR SELECT TO public USING (true);
CREATE POLICY "Users can subscribe"
  ON public.idea_notify_subscriptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unsubscribe"
  ON public.idea_notify_subscriptions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 5. notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  app_id uuid,
  title text NOT NULL,
  body text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user ON public.notifications(user_id, read, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 6a. Sync upvotes_count
CREATE OR REPLACE FUNCTION public.sync_upvotes_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.apps SET upvotes_count = upvotes_count + 1 WHERE id = NEW.app_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.apps SET upvotes_count = GREATEST(upvotes_count - 1, 0) WHERE id = OLD.app_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END; $$;

CREATE TRIGGER trg_sync_upvotes_count
AFTER INSERT OR DELETE ON public.idea_upvotes
FOR EACH ROW EXECUTE FUNCTION public.sync_upvotes_count();

-- 6b. Sync notify_count
CREATE OR REPLACE FUNCTION public.sync_notify_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.apps SET notify_count = notify_count + 1 WHERE id = NEW.app_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.apps SET notify_count = GREATEST(notify_count - 1, 0) WHERE id = OLD.app_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END; $$;

CREATE TRIGGER trg_sync_notify_count
AFTER INSERT OR DELETE ON public.idea_notify_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.sync_notify_count();

-- 6c. Fan-out notifications when upcoming -> published
CREATE OR REPLACE FUNCTION public.notify_subscribers_on_publish()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF OLD.status = 'upcoming' AND NEW.status = 'published' THEN
    INSERT INTO public.notifications (user_id, type, app_id, title, body)
    SELECT s.user_id, 'app_launched', NEW.id,
           'An app you were waiting for just launched',
           NEW.app_name || ' is now live. Tap to check it out.'
    FROM public.idea_notify_subscriptions s
    WHERE s.app_id = NEW.id AND s.notified_at IS NULL AND s.user_id <> NEW.user_id;

    UPDATE public.idea_notify_subscriptions
      SET notified_at = now()
      WHERE app_id = NEW.id AND notified_at IS NULL;
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_notify_subscribers_on_publish
AFTER UPDATE OF status ON public.apps
FOR EACH ROW EXECUTE FUNCTION public.notify_subscribers_on_publish();

-- 7. Enforce 5 active ideas per user (status='upcoming')
CREATE OR REPLACE FUNCTION public.enforce_idea_cap()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  active_count int;
BEGIN
  IF NEW.status = 'upcoming' THEN
    SELECT COUNT(*) INTO active_count
      FROM public.apps
      WHERE user_id = NEW.user_id
        AND status = 'upcoming'
        AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);
    IF active_count >= 5 THEN
      RAISE EXCEPTION 'You can have at most 5 active upcoming ideas. Convert or delete an older one first.';
    END IF;
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_enforce_idea_cap
BEFORE INSERT OR UPDATE OF status ON public.apps
FOR EACH ROW EXECUTE FUNCTION public.enforce_idea_cap();