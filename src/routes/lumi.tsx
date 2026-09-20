import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Lumi } from "@/components/Lumi";
import { Button } from "@/components/Button";
import { Field } from "@/components/Field";
import { DataError } from "@/components/DataError";
import { LumiSkeleton } from "@/components/skeletons";
import { useDelayedFlag } from "@/hooks/useDelayedFlag";
import { supabase } from "@/integrations/supabase/client";
import {
  PRIORITY_LABEL,
  announce,
  currentUserId,
  hubColor,
  useChat,
  useHubs,
  useTasks,
} from "@/lib/app";
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
  const chatQ = useChat();
  const tasksQ = useTasks();
  const hubsQ = useHubs();
  const messages = chatQ.data ?? [];
  const tasks = tasksQ.data ?? [];
  const hubs = hubsQ.data ?? [];
  const loading = chatQ.isLoading || tasksQ.isLoading || hubsQ.isLoading;
  const failed = chatQ.isError || tasksQ.isError || hubsQ.isError;
  const showSkeleton = useDelayedFlag(loading);
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
      const owner = await currentUserId();
      if (!owner) throw new Error("the session ended. Sign in again");
      await supabase.from("chat_messages").insert({ role: "user", content: q, user_id: owner });
      await qc.invalidateQueries({ queryKey: ["chat"] });
      const res = await ask({ data: { question: q } });
      await supabase
        .from("chat_messages")
        .insert({ role: "lumi", content: res.text, user_id: owner });
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

  if (loading) return showSkeleton ? <LumiSkeleton /> : null;
  if (failed)
    return (
      <DataError
        error={chatQ.error ?? tasksQ.error ?? hubsQ.error}
        onRetry={() => {
          chatQ.refetch();
          tasksQ.refetch();
          hubsQ.refetch();
        }}
        what="the conversation"
      />
    );

  return (
    <div className={`lumi-screen cascade space-y-4 ${thinking ? "is-thinking" : ""}`}>
      <header className="page-header grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
        <Lumi
          variant={thinking ? "think" : glow ? "glow" : "idle"}
          size={52}
          className={glow ? "halo-flash shrink-0" : "shrink-0"}
          draw
          interactive
        />

        <div className="min-w-0">
          <p className="section-kicker label-xs text-ink-3">
            {thinking ? "Thinking" : "Ready to help"}
          </p>
          <h1 className="t-screen text-ink">Lumi</h1>
        </div>
      </header>

      {billing.signedIn ? (
        <p className="num px-1 t-aux text-ink-2">
          {billing.aiUsed} of {billing.aiLimit} this month · {TIER_LABEL[billing.tier]}
        </p>
      ) : (
        <div className="card p-4">
          <p className="label-xs text-ink-3">Example</p>
          <p className="mt-2 t-body font-bold text-ink">
            What matters most to close today
          </p>
          <p className="mt-2 t-body font-normal text-ink-2">
            Two of your three slots are open. Prepare the team meeting is marked Important and sits
            in Work, so start there. The other slot holds a task with one focus session left.
          </p>
          <p className="mt-3 t-body font-normal text-ink-2">
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
          <p className="card p-4 t-body font-normal text-ink-2">
            Lumi reads your hubs and tasks and answers only from them. Ask a question or pick a
            prompt below.
          </p>
        ) : null}

        {messages.map((m) =>
          m.role === "user" ? (
            <div key={m.id} className="text-right">
              <p className="label-xs text-ink-3">You</p>
              <p className="chat-bubble-user mt-1 text-left t-body font-bold text-ink">{m.content}</p>
            </div>
          ) : (
            <div key={m.id} className="chat-bubble-lumi">
              <p className="label-xs" style={{ color: "var(--ink-2)" }}>
                Lumi
              </p>
              <p className="mt-1 whitespace-pre-wrap t-body font-normal text-ink">
                {m.content}
              </p>
              {matched(m.content).length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {matched(m.content).map((t) => {
                    const hub = hubs.find((h) => h.id === t.hub_id);
                    return (
                      <li
                        key={t.id}
                        className="surface-sunk p-3"
                      >
                        <p className="t-body font-bold text-ink">{t.title}</p>
                        <p className="mt-1 flex items-center gap-1.5 t-aux text-ink-2">
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
          <p className="lumi-thinking t-body text-ink-2"><span aria-hidden="true" />Lumi is looking through your tasks</p>
        ) : null}
        {error ? (
          <p className="t-aux" style={{ color: "var(--coral-tx)" }}>
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
            className="min-h-11 shrink-0 rounded-chip border border-[var(--line-ctl)] bg-paper px-4 t-aux font-bold"
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
        className="sticky bottom-0 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2"
      >
        <Field
          id="lumi-question"
          label="Question for Lumi"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask about your work"
          className="mb-0"
        />
        <Button
          type="submit"
          variant="primary"
          size="lg"
          aria-label="Send question"
          disabled={thinking}
          className="h-12 w-12 shrink-0 px-0"
        >
          <Send size={18} aria-hidden="true" />
        </Button>
      </form>
    </div>
  );
}
