
CREATE TABLE public.hubs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT 'blue',
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hubs TO anon, authenticated;
GRANT ALL ON public.hubs TO service_role;
ALTER TABLE public.hubs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hubs open" ON public.hubs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  hub_id UUID REFERENCES public.hubs(id) ON DELETE CASCADE,
  priority TEXT NOT NULL DEFAULT 'p3',
  board_column TEXT NOT NULL DEFAULT 'backlog',
  is_today BOOLEAN NOT NULL DEFAULT false,
  is_done BOOLEAN NOT NULL DEFAULT false,
  done_at TIMESTAMPTZ,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO anon, authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tasks open" ON public.tasks FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hub_id UUID REFERENCES public.hubs(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Без названия',
  blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO anon, authenticated;
GRANT ALL ON public.documents TO service_role;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "documents open" ON public.documents FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.app_state (
  id TEXT NOT NULL PRIMARY KEY,
  streak INT NOT NULL DEFAULT 0,
  best_streak INT NOT NULL DEFAULT 0,
  last_streak_date DATE,
  theme TEXT NOT NULL DEFAULT 'light',
  lumi_enabled BOOLEAN NOT NULL DEFAULT true,
  streaks_enabled BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_state TO anon, authenticated;
GRANT ALL ON public.app_state TO service_role;
ALTER TABLE public.app_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "app_state open" ON public.app_state FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_messages TO anon, authenticated;
GRANT ALL ON public.chat_messages TO service_role;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "chat open" ON public.chat_messages FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

INSERT INTO public.app_state (id) VALUES ('main');

INSERT INTO public.hubs (id, name, description, color, position) VALUES
  ('11111111-1111-4111-8111-111111111111', 'Продукт', 'Разработка и релизы', 'blue', 0),
  ('22222222-2222-4222-8222-222222222222', 'Компания', 'Процессы и команда', 'mint', 1),
  ('33333333-3333-4333-8333-333333333333', 'Личное', 'Дом, здоровье, планы', 'coral', 2);

INSERT INTO public.tasks (title, hub_id, priority, board_column, is_today, position) VALUES
  ('Собрать макет экрана Пульс', '11111111-1111-4111-8111-111111111111', 'p1', 'doing', true, 0),
  ('Согласовать план релиза', '11111111-1111-4111-8111-111111111111', 'p2', 'backlog', false, 1),
  ('Подготовить встречу команды', '22222222-2222-4222-8222-222222222222', 'p2', 'review', true, 0),
  ('Записаться на тренировку', '33333333-3333-4333-8333-333333333333', 'p3', 'backlog', false, 0);

INSERT INTO public.documents (hub_id, title, blocks) VALUES
  ('11111111-1111-4111-8111-111111111111', 'Заметки по релизу', '[{"id":"b1","type":"heading","text":"План релиза"},{"id":"b2","type":"paragraph","text":"Короткий свод задач и сроков."},{"id":"b3","type":"check","text":"Собрать список правок","checked":false}]'::jsonb);
