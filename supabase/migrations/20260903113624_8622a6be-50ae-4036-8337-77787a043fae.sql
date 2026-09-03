ALTER TABLE public.app_state
  ADD COLUMN IF NOT EXISTS onboarded boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS display_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS halo_log jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS freeze_month text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS freeze_notice boolean NOT NULL DEFAULT false;

ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS focus_sessions integer NOT NULL DEFAULT 1;

ALTER TABLE public.tasks
  DROP CONSTRAINT IF EXISTS tasks_focus_sessions_check;

ALTER TABLE public.tasks
  ADD CONSTRAINT tasks_focus_sessions_check CHECK (focus_sessions BETWEEN 1 AND 3);

DELETE FROM public.tasks;

UPDATE public.app_state
SET streak = 0,
    best_streak = 0,
    last_streak_date = NULL,
    onboarded = false,
    halo_log = '[]'::jsonb,
    updated_at = now()
WHERE id = 'main';