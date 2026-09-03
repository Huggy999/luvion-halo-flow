import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Lumi } from "@/components/Lumi";
import { supabase } from "@/integrations/supabase/client";
import { announce, hubColor, useChat, useHubs, useTasks } from "@/lib/app";
import { askLumi } from "@/lib/lumi.functions";
import { BoundaryCard } from "@/components/BoundaryCard";
import { TIER_LABEL, isBoundaryHidden, useBilling } from "@/lib/billing";

export const Route = createFileRoute("/lumi")({
  head: () => ({
    meta: [
      { title: "Луми — помощник Luvion" },
      {
        name: "description",
        content:
          "Луми отвечает по вашим реальным хабам и задачам: сводки, приоритеты и подсказки по плану дня.",
      },
      { property: "og:title", content: "Луми — помощник Luvion" },
      {
        property: "og:description",
        content: "Помощник, который читает ваши задачи и отвечает по делу.",
      },
    ],
  }),
  component: LumiScreen,
});

const CHIPS = [
  "Что у меня на сегодня",
  "Какие задачи в работе",
  "Что важнее всего закрыть",
  "Сводка по хабам",
];

function LumiScreen() {
  const { data: messages = [] } = useChat();
  const { data: tasks = [] } = useTasks();
  const { data: hubs = [] } = useHubs();
  const qc = useQueryClient();
  const ask = useServerFn(askLumi);
  const [text, setText] = useState("");
  const [thinking, setThinking] = useState(false);
  const [glow, setGlow] = useState(false);
  const [error, setError] = useState("");
  const [softDismissed, setSoftDismissed] = useState(false);
  const { billing, refetch } = useBilling();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, thinking]);

  const send = async (question: string) => {
    const q = question.trim();
    if (!q || thinking) return;
    if (!billing.signedIn) {
      setError("Войдите, чтобы Луми считал ваши запросы: счётчик привязан к аккаунту.");
      return;
    }
    setText("");
    setError("");
    setThinking(true);
    try {
      await supabase.from("chat_messages").insert({ role: "user", content: q });
      await qc.invalidateQueries({ queryKey: ["chat"] });
      const res = await ask({ data: { question: q } });
      await supabase.from("chat_messages").insert({ role: "lumi", content: res.text });
      await refetch();
      await qc.invalidateQueries({ queryKey: ["chat"] });
      setGlow(true);
      window.setTimeout(() => setGlow(false), 900);
      announce("Ответ Луми готов");
    } catch (e) {
      setError(`Ответ не получен: ${(e as Error).message}. Повторите вопрос.`);
    } finally {
      setThinking(false);
    }
  };

  const ratio = billing.aiLimit ? billing.aiUsed / billing.aiLimit : 0;
  const softWarning =
    billing.signedIn &&
    ratio >= 0.8 &&
    !softDismissed &&
    !isBoundaryHidden("lumi-soft");

  const matched = (content: string) =>
    tasks.filter((t) => content.toLowerCase().includes(t.title.toLowerCase())).slice(0, 3);

  return (
    <div className="cascade space-y-4">
      <header className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
        <Lumi
          variant={thinking ? "think" : glow ? "glow" : "idle"}
          size={52}
          className={glow ? "halo-flash shrink-0" : "shrink-0"}
        />
        <div className="min-w-0">
          <p className="label-xs text-ink-3">
            {thinking ? "Думает" : "Готов помочь"}
          </p>
          <h1 className="screen-title text-[26px] leading-tight text-ink">Луми</h1>
        </div>
      </header>

      {billing.signedIn ? (
        <p className="px-1 text-[13px] text-ink-2">
          Запросы к Луми: {billing.aiUsed} из {billing.aiLimit} в месяц на тарифе{" "}
          {TIER_LABEL[billing.tier]}
        </p>
      ) : (
        <p className="card p-4 text-[14px] leading-relaxed text-ink-2">
          Чтобы Луми отвечал, нужен аккаунт: запросы считаются на сервере и привязаны к вам.
          Задачи, доска, документы, серия и фокус-таймер работают и без входа.{" "}
          <Link to="/auth" style={{ color: "var(--blue-ink)" }}>
            Войти
          </Link>
        </p>
      )}

      {softWarning ? (
        <BoundaryCard
          id="lumi-soft"
          left={`Осталось ${billing.aiLimit - billing.aiUsed} запросов к Луми из ${billing.aiLimit} в этом месяце.`}
          stops="ответы и черновики от Луми"
          continues="поиск по вашим документам и задачам, серия, нимб и фокус-таймер"
          onDismiss={() => setSoftDismissed(true)}
        />
      ) : null}

      <section className="space-y-5" aria-label="Лента ответов">
        {messages.length === 0 ? (
          <p className="card p-4 text-sm text-ink-2">
            Луми читает ваши хабы и задачи и отвечает только по ним. Задайте вопрос или
            выберите подсказку ниже.
          </p>
        ) : null}

        {messages.map((m) =>
          m.role === "user" ? (
            <div key={m.id} className="text-right">
              <p className="label-xs text-ink-3">Вы</p>
              <p className="mt-1 text-[15px] font-bold text-ink">{m.content}</p>
            </div>
          ) : (
            <div key={m.id}>
              <p className="label-xs" style={{ color: "var(--ink-2)" }}>
                Луми
              </p>
              <p className="mt-1 whitespace-pre-wrap text-[15px] leading-relaxed text-ink">
                {m.content}
              </p>
              {matched(m.content).length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {matched(m.content).map((t) => {
                    const hub = hubs.find((h) => h.id === t.hub_id);
                    return (
                      <li
                        key={t.id}
                        className="rounded-tile border border-line bg-paper p-3"
                      >
                        <p className="text-[14px] font-bold text-ink">{t.title}</p>
                        <p className="mt-1 flex items-center gap-1.5 text-[12px] text-ink-2">
                          <span
                            className="h-2 w-2 rounded-chip"
                            style={{ background: hubColor(hub?.color ?? "blue") }}
                            aria-hidden="true"
                          />
                          {hub?.name ?? "Без хаба"} · {t.priority.toUpperCase()} ·{" "}
                          {t.is_done ? "закрыта" : "в работе"}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>
          ),
        )}

        {thinking ? (
          <p className="text-[15px] text-ink-2">Луми смотрит ваши задачи</p>
        ) : null}
        {error ? (
          <p className="text-[13px]" style={{ color: "var(--coral-tx)" }}>
            {error}
          </p>
        ) : null}
        <div ref={endRef} />
      </section>

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {CHIPS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => send(c)}
            className="min-h-11 shrink-0 rounded-chip border border-line-2 bg-paper px-4 text-[13px] font-bold"
            style={{ color: "var(--blue-ink)" }}
          >
            {c}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(text);
        }}
        className="sticky bottom-0 grid grid-cols-[minmax(0,1fr)_auto] gap-2"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label="Вопрос для Луми"
          placeholder="Спросите о задачах"
          className="min-h-12 w-full rounded-btn border border-line-2 bg-paper px-4 text-ink"
        />
        <button
          type="submit"
          aria-label="Отправить вопрос"
          disabled={thinking}
          className="grid h-12 w-12 place-items-center rounded-btn bg-blue-btn text-white disabled:opacity-60"
        >
          <Send size={18} aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
