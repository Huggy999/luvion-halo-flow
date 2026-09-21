CREATE TABLE public.daily_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  local_date date NOT NULL,
  revision integer NOT NULL DEFAULT 0,
  closed_at timestamptz,
  reflection text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, local_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_plans TO authenticated;
GRANT ALL ON public.daily_plans TO service_role;
ALTER TABLE public.daily_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read their daily plans" ON public.daily_plans FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Owners insert their daily plans" ON public.daily_plans FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owners update their daily plans" ON public.daily_plans FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owners delete their daily plans" ON public.daily_plans FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.daily_plan_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.daily_plans(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  slot smallint NOT NULL CHECK (slot BETWEEN 1 AND 3),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (plan_id, slot),
  UNIQUE (plan_id, task_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_plan_slots TO authenticated;
GRANT ALL ON public.daily_plan_slots TO service_role;
ALTER TABLE public.daily_plan_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read their daily plan slots" ON public.daily_plan_slots FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Owners insert their daily plan slots" ON public.daily_plan_slots FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owners update their daily plan slots" ON public.daily_plan_slots FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owners delete their daily plan slots" ON public.daily_plan_slots FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.operation_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  operation_id uuid NOT NULL,
  operation_kind text NOT NULL,
  payload_key text NOT NULL,
  result jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, operation_id)
);
GRANT SELECT, INSERT ON public.operation_receipts TO authenticated;
GRANT ALL ON public.operation_receipts TO service_role;
ALTER TABLE public.operation_receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read their operation receipts" ON public.operation_receipts FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Owners insert their operation receipts" ON public.operation_receipts FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE INDEX daily_plans_user_date_idx ON public.daily_plans (user_id, local_date DESC);
CREATE INDEX daily_plan_slots_user_plan_idx ON public.daily_plan_slots (user_id, plan_id, slot);
CREATE INDEX operation_receipts_user_created_idx ON public.operation_receipts (user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.set_daily_plan_slot(
  _local_date date,
  _task_id uuid,
  _slot smallint,
  _expected_revision integer,
  _operation_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _plan public.daily_plans%ROWTYPE;
  _payload_key text := concat_ws('|', _local_date::text, _task_id::text, _slot::text, _expected_revision::text);
  _receipt public.operation_receipts%ROWTYPE;
  _result jsonb;
BEGIN
  IF _user_id IS NULL THEN RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'AUTH_REQUIRED'; END IF;
  IF _slot NOT BETWEEN 1 AND 3 THEN RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'INVALID_SLOT'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.tasks WHERE id = _task_id AND user_id = _user_id) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'TASK_NOT_AVAILABLE';
  END IF;

  SELECT * INTO _receipt FROM public.operation_receipts WHERE user_id = _user_id AND operation_id = _operation_id;
  IF FOUND THEN
    IF _receipt.operation_kind <> 'set_daily_plan_slot' OR _receipt.payload_key <> _payload_key THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'OPERATION_ID_REUSED';
    END IF;
    RETURN _receipt.result;
  END IF;

  INSERT INTO public.daily_plans (user_id, local_date)
  VALUES (_user_id, _local_date)
  ON CONFLICT (user_id, local_date) DO NOTHING;

  SELECT * INTO _plan FROM public.daily_plans
  WHERE user_id = _user_id AND local_date = _local_date
  FOR UPDATE;

  IF _plan.revision <> _expected_revision THEN
    RAISE EXCEPTION USING ERRCODE = '40001', MESSAGE = 'REVISION_CONFLICT';
  END IF;

  DELETE FROM public.daily_plan_slots
  WHERE plan_id = _plan.id AND (task_id = _task_id OR slot = _slot);

  INSERT INTO public.daily_plan_slots (plan_id, user_id, task_id, slot)
  VALUES (_plan.id, _user_id, _task_id, _slot);

  UPDATE public.daily_plans
  SET revision = revision + 1, updated_at = now()
  WHERE id = _plan.id
  RETURNING jsonb_build_object('plan_id', id, 'revision', revision, 'local_date', local_date) INTO _result;

  INSERT INTO public.operation_receipts (user_id, operation_id, operation_kind, payload_key, result)
  VALUES (_user_id, _operation_id, 'set_daily_plan_slot', _payload_key, _result);
  RETURN _result;
END;
$$;

CREATE OR REPLACE FUNCTION public.remove_daily_plan_task(
  _local_date date,
  _task_id uuid,
  _expected_revision integer,
  _operation_id uuid
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _plan public.daily_plans%ROWTYPE;
  _payload_key text := concat_ws('|', _local_date::text, _task_id::text, _expected_revision::text);
  _receipt public.operation_receipts%ROWTYPE;
  _result jsonb;
BEGIN
  IF _user_id IS NULL THEN RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'AUTH_REQUIRED'; END IF;
  SELECT * INTO _receipt FROM public.operation_receipts WHERE user_id = _user_id AND operation_id = _operation_id;
  IF FOUND THEN
    IF _receipt.operation_kind <> 'remove_daily_plan_task' OR _receipt.payload_key <> _payload_key THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'OPERATION_ID_REUSED';
    END IF;
    RETURN _receipt.result;
  END IF;

  SELECT * INTO _plan FROM public.daily_plans
  WHERE user_id = _user_id AND local_date = _local_date
  FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('plan_id', null, 'revision', 0, 'local_date', _local_date);
  END IF;
  IF _plan.revision <> _expected_revision THEN
    RAISE EXCEPTION USING ERRCODE = '40001', MESSAGE = 'REVISION_CONFLICT';
  END IF;

  DELETE FROM public.daily_plan_slots WHERE plan_id = _plan.id AND task_id = _task_id;
  UPDATE public.daily_plans SET revision = revision + 1, updated_at = now()
  WHERE id = _plan.id
  RETURNING jsonb_build_object('plan_id', id, 'revision', revision, 'local_date', local_date) INTO _result;
  INSERT INTO public.operation_receipts (user_id, operation_id, operation_kind, payload_key, result)
  VALUES (_user_id, _operation_id, 'remove_daily_plan_task', _payload_key, _result);
  RETURN _result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_daily_plan_slot(date, uuid, smallint, integer, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_daily_plan_task(date, uuid, integer, uuid) TO authenticated;

WITH ranked AS (
  SELECT t.user_id, t.id AS task_id, row_number() OVER (PARTITION BY t.user_id ORDER BY t.position, t.created_at, t.id) AS slot
  FROM public.tasks t
  WHERE t.is_today = true AND t.is_done = false
), plans AS (
  INSERT INTO public.daily_plans (user_id, local_date)
  SELECT DISTINCT user_id, CURRENT_DATE FROM ranked WHERE slot <= 3
  ON CONFLICT (user_id, local_date) DO UPDATE SET updated_at = EXCLUDED.updated_at
  RETURNING id, user_id
)
INSERT INTO public.daily_plan_slots (plan_id, user_id, task_id, slot)
SELECT p.id, r.user_id, r.task_id, r.slot::smallint
FROM ranked r
JOIN public.daily_plans p ON p.user_id = r.user_id AND p.local_date = CURRENT_DATE
WHERE r.slot <= 3
ON CONFLICT (plan_id, slot) DO NOTHING;