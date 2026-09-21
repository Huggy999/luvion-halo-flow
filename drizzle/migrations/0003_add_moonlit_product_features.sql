ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS notes text NOT NULL DEFAULT '';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS duration_minutes integer NOT NULL DEFAULT 25 CHECK (duration_minutes IN (15, 25, 45, 60));
ALTER TABLE public.hubs ADD COLUMN IF NOT EXISTS icon text NOT NULL DEFAULT 'leaf';
ALTER TABLE public.hubs ADD COLUMN IF NOT EXISTS archived_at timestamptz;
ALTER TABLE public.app_state ADD COLUMN IF NOT EXISTS intention text NOT NULL DEFAULT 'Make steady progress';
ALTER TABLE public.app_state ADD COLUMN IF NOT EXISTS avatar text NOT NULL DEFAULT 'lumi';
ALTER TABLE public.app_state ADD COLUMN IF NOT EXISTS motion_preference text NOT NULL DEFAULT 'system' CHECK (motion_preference IN ('system','full','reduced'));
ALTER TABLE public.app_state ADD COLUMN IF NOT EXISTS sound_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE public.app_state ADD COLUMN IF NOT EXISTS onboarding_step integer NOT NULL DEFAULT 1;

CREATE TABLE IF NOT EXISTS public.daily_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  local_date date NOT NULL,
  mood text NOT NULL CHECK (mood IN ('clear','steady','stretched')),
  reflection text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, local_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_checkins TO authenticated;
GRANT ALL ON public.daily_checkins TO service_role;
ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read their checkins" ON public.daily_checkins FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Owners insert their checkins" ON public.daily_checkins FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owners update their checkins" ON public.daily_checkins FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owners delete their checkins" ON public.daily_checkins FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.focus_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id uuid REFERENCES public.tasks(id) ON DELETE SET NULL,
  planned_minutes integer NOT NULL CHECK (planned_minutes BETWEEN 1 AND 180),
  started_at timestamptz NOT NULL,
  paused_at timestamptz,
  paused_seconds integer NOT NULL DEFAULT 0,
  ended_at timestamptz,
  outcome text CHECK (outcome IN ('completed','finished_early','reset')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.focus_sessions TO authenticated;
GRANT ALL ON public.focus_sessions TO service_role;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read their focus sessions" ON public.focus_sessions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Owners insert their focus sessions" ON public.focus_sessions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owners update their focus sessions" ON public.focus_sessions FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owners delete their focus sessions" ON public.focus_sessions FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE INDEX IF NOT EXISTS focus_sessions_user_started_idx ON public.focus_sessions (user_id, started_at DESC);

CREATE TABLE IF NOT EXISTS public.activity_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  local_date date NOT NULL,
  kind text NOT NULL CHECK (kind IN ('task_completed','focus_completed','daily_continuation')),
  source_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, local_date, kind, source_id)
);
GRANT SELECT, INSERT ON public.activity_events TO authenticated;
GRANT ALL ON public.activity_events TO service_role;
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read their activity" ON public.activity_events FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Owners insert their activity" ON public.activity_events FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE INDEX IF NOT EXISTS activity_events_user_date_idx ON public.activity_events (user_id, local_date DESC);

CREATE TABLE IF NOT EXISTS public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_key text NOT NULL,
  earned_at timestamptz NOT NULL DEFAULT now(),
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (user_id, achievement_key)
);
GRANT SELECT, INSERT ON public.achievements TO authenticated;
GRANT ALL ON public.achievements TO service_role;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read their achievements" ON public.achievements FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Owners insert their achievements" ON public.achievements FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());