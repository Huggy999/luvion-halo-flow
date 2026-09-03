import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Lumi } from "@/components/Lumi";
import { supabase } from "@/integrations/supabase/client";
import { PRIORITY_LABEL, announce, hubColor, useChat, useHubs, useTasks } from "@/lib/app";
import { askLumi } from "@/lib/lumi.functions";
import { BoundaryCard } from "@/components/BoundaryCard";
import { TIER_LABEL, isBoundaryHidden, useBilling } from "@/lib/billing";

export const Route = createFileRoute("/lumi")({
  head: () => ({
    meta: [
      { title: "Lumi — the Luvion assistant" },
      {
        name: "description",
        content:
          "Lumi answers from your real hubs and tasks: summaries, priorities and hints for the day.",
      },
      { property: "og:title", content: "Lumi — the Luvion assistant" },
      {
        property: "og:description",
        content: "An assistant that reads your tasks and answers to the point.",
      },
    ],
  }),
  component: LumiScreen,
});

const CHIPS = [
  "What is on my plate today",
  "Which tasks are in progress",
  "What matters most to close",
  "Summary across hubs",
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
      setError("Sign in so Lumi can count your requests — the counter belongs to the account.");
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
      announce("Lumi answered");
    } catch (e) {
      setError(`No answer came back — ${(e as Error).message}. Ask again.`);
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
            {thinking ? "Thinking" : "Ready to help"}
          </p>
          <h1 className="screen-title text-[26px] leading-tight text-ink">Lumi</h1>
        </div>
      </header>

      {billing.signedIn ? (
        <p className="num px-1 text-[13px] text-ink-2">
          {billing.aiUsed} of {billing.aiLimit} this month · {TIER_LABEL[billing.tier]}
        </p>
      ) : (
        <div className="card p-4">
          <p className="label-xs text-ink-3">Example</p>
          <p className="mt-2 text-[15px] font-bold text-ink">
            What matters most to close today
          </p>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-2">
            Two of your three slots are open. Prepare the team meeting is marked Important and sits
            in Work, so start there. The other slot holds a task with one focus session left.
          </p>
          <p className="mt-3 text-[14px] leading-relaxed text-ink-2">
            Lumi needs an account: requests are counted on the server and belong to you. Tasks, the
            board, docs, the halo and the focus timer work without signing in.{" "}
            <Link to="/auth" style={{ color: "var(--blue-ink)" }}>
              Sign in
            </Link>
          </p>
        </div>
      )}


      {softWarning ? (
        <BoundaryCard
          id="lumi-soft"
          left={`${billing.aiLimit - billing.aiUsed} of ${billing.aiLimit} Lumi requests left this month.`}
          stops="Lumi answers and drafts"
          continues="search across your docs and tasks, the halo, the streak and the focus timer"
          onDismiss={() => setSoftDismissed(true)}
        />
      ) : null}

      <section className="space-y-5" aria-label="Conversation">
        {messages.length === 0 ? (
          <p className="card p-4 text-sm text-ink-2">
            Lumi reads your hubs and tasks and answers only from them. Ask a question or pick a
            prompt below.
          </p>
        ) : null}

        {messages.map((m) =>
          m.role === "user" ? (
            <div key={m.id} className="text-right">
              <p className="label-xs text-ink-3">You</p>
              <p className="mt-1 text-[15px] font-bold text-ink">{m.content}</p>
            </div>
          ) : (
            <div key={m.id}>
              <p className="label-xs" style={{ color: "var(--ink-2)" }}>
                Lumi
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
                          {hub?.name ?? "No hub"} · {PRIORITY_LABEL[t.priority]} ·{" "}
                          {t.is_done ? "done" : "in progress"}
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
          <p className="text-[15px] text-ink-2">Lumi is looking through your tasks</p>
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
          aria-label="Question for Lumi"
          placeholder="Ask about your work"
          className="min-h-12 w-full rounded-btn border border-line-2 bg-paper px-4 text-ink"
        />
        <button
          type="submit"
          aria-label="Send question"
          disabled={thinking}
          className="grid h-12 w-12 place-items-center rounded-btn bg-blue-btn text-white disabled:opacity-60"
        >
          <Send size={18} aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
