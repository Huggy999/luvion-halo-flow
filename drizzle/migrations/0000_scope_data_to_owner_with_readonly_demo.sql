-- 1. Ownership columns
ALTER TABLE public.app_state ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.hubs ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS app_state_user_id_idx ON public.app_state(user_id);
CREATE INDEX IF NOT EXISTS hubs_user_id_idx ON public.hubs(user_id);
CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS documents_user_id_idx ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS chat_messages_user_id_idx ON public.chat_messages(user_id);

-- 2. Drop every existing open policy on these tables
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT policyname, tablename FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('app_state','hubs','tasks','documents','chat_messages')
  LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- 3. Row level security on
ALTER TABLE public.app_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- 4. Grants: visitors may only read, owners may write
REVOKE INSERT, UPDATE, DELETE ON public.app_state, public.hubs, public.tasks, public.documents, public.chat_messages FROM anon;
GRANT SELECT ON public.app_state, public.hubs, public.tasks, public.documents TO anon;
REVOKE ALL ON public.chat_messages FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_state, public.hubs, public.tasks, public.documents, public.chat_messages TO authenticated;
GRANT ALL ON public.app_state, public.hubs, public.tasks, public.documents, public.chat_messages TO service_role;

-- 5. Owner policies; rows with no owner are the public read-only demo
CREATE POLICY "Owners read their app state" ON public.app_state FOR SELECT TO anon, authenticated
  USING (user_id = auth.uid() OR (user_id IS NULL AND auth.uid() IS NULL));
CREATE POLICY "Owners insert their app state" ON public.app_state FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owners update their app state" ON public.app_state FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owners delete their app state" ON public.app_state FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Owners read their hubs" ON public.hubs FOR SELECT TO anon, authenticated
  USING (user_id = auth.uid() OR (user_id IS NULL AND auth.uid() IS NULL));
CREATE POLICY "Owners insert their hubs" ON public.hubs FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owners update their hubs" ON public.hubs FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owners delete their hubs" ON public.hubs FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Owners read their tasks" ON public.tasks FOR SELECT TO anon, authenticated
  USING (user_id = auth.uid() OR (user_id IS NULL AND auth.uid() IS NULL));
CREATE POLICY "Owners insert their tasks" ON public.tasks FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owners update their tasks" ON public.tasks FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owners delete their tasks" ON public.tasks FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Owners read their documents" ON public.documents FOR SELECT TO anon, authenticated
  USING (user_id = auth.uid() OR (user_id IS NULL AND auth.uid() IS NULL));
CREATE POLICY "Owners insert their documents" ON public.documents FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owners update their documents" ON public.documents FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owners delete their documents" ON public.documents FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Chat is private to the owner, never part of the demo
CREATE POLICY "Owners read their chat" ON public.chat_messages FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Owners insert their chat" ON public.chat_messages FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owners update their chat" ON public.chat_messages FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owners delete their chat" ON public.chat_messages FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- 6. Existing chat history has no owner; clear it rather than leak it
DELETE FROM public.chat_messages WHERE user_id IS NULL;