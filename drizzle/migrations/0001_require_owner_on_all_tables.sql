-- Remove the shared anonymous bucket: every row must belong to a signed-in account.
DELETE FROM public.chat_messages WHERE user_id IS NULL;
DELETE FROM public.documents WHERE user_id IS NULL;
DELETE FROM public.tasks WHERE user_id IS NULL;
DELETE FROM public.hubs WHERE user_id IS NULL;
DELETE FROM public.app_state WHERE user_id IS NULL;

ALTER TABLE public.app_state ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.hubs ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.tasks ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.documents ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.chat_messages ALTER COLUMN user_id SET NOT NULL;

DROP POLICY IF EXISTS "app_state_select" ON public.app_state;
DROP POLICY IF EXISTS "hubs_select" ON public.hubs;
DROP POLICY IF EXISTS "tasks_select" ON public.tasks;
DROP POLICY IF EXISTS "documents_select" ON public.documents;

CREATE POLICY "app_state_select" ON public.app_state FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "hubs_select" ON public.hubs FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "tasks_select" ON public.tasks FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "documents_select" ON public.documents FOR SELECT TO authenticated USING (user_id = auth.uid());

REVOKE ALL ON public.app_state FROM anon;
REVOKE ALL ON public.hubs FROM anon;
REVOKE ALL ON public.tasks FROM anon;
REVOKE ALL ON public.documents FROM anon;
REVOKE ALL ON public.chat_messages FROM anon;