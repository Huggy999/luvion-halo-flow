import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Plus } from "lucide-react";
import { Lumi } from "@/components/Lumi";
import { TaskRow } from "@/components/TaskRow";
import { announce, todayISO, useHubs, useTaskMutations, useTasks } from "@/lib/app";

export const Route = createFileRoute("/day")({
  head: () => ({
    meta: [
      { title: "Today — Luvion" },
      {
        name: "description",
        content:
          "A real 25 minute focus timer with Lumi inside the ring and the three tasks picked for today.",
      },
      { property: "og:title", content: "Today — Luvion" },
      {
        property: "og:description",
        content: "Focus sessions of 25 minutes and a short list of tasks for today.",
      },
    ],
  }),
  component: DayScreen,
});

const FOCUS_SECONDS = 25 * 60;

function DayScreen() {
  const { data: tasks = [] } = useTasks();
  const { data: hubs = [] } = useHubs();
  const { completeTask, patchTask } = useTaskMutations();

  const [left, setLeft] = useState(FOCUS_SECONDS);
  const [running, setRunning] = useState(false);
  const [session, setSession] = useState(1);
  const tick = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    tick.current = window.setInterval(() => {
      setLeft((prev) => {
        if (prev <= 1) {
          setRunning(false);
          setSession((s) => (s >= 4 ? 1 : s + 1));
          announce("Focus session finished");
          return FOCUS_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (tick.current) window.clearInterval(tick.current);
    };
  }, [running]);

  const today = todayISO();
  const focus = tasks.filter((t) => t.is_today);
  const pool = tasks.filter((t) => !t.is_today && !t.is_done);
  const doneToday = tasks.filter((t) => t.done_at?.slice(0, 10) === today).length;

  const ring = 2 * Math.PI * 46;
  const progress = 1 - left / FOCUS_SECONDS;
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  return (
    <div className="cascade space-y-4">
      <header>
        <p className="label-xs text-ink-3">Focus · Session {session} of 4</p>
        <h1 className="screen-title mt-1 text-[30px] leading-tight text-ink">Today</h1>
      </header>

      <section className="card p-5" aria-label="Focus timer">
        <div className="relative mx-auto h-56 w-56">
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90">
            <circle cx="50" cy="50" r="46" fill="none" stroke="var(--line)" strokeWidth="5" />
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="var(--blue)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={ring}
              strokeDashoffset={ring * (1 - progress)}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
            <Lumi variant={running ? "glow" : "sleep"} size={70} />
            <p className="num text-[34px] font-bold leading-none text-ink">
              {mm}:{ss}
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            className="inline-flex min-h-11 items-center gap-2 rounded-btn bg-blue-btn px-6 text-sm font-bold text-white"
          >
            {running ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
            {running ? "Pause" : "Start focus"}
          </button>
          <button
            type="button"
            aria-label="Reset timer"
            onClick={() => {
              setRunning(false);
              setLeft(FOCUS_SECONDS);
            }}
            className="grid h-11 w-11 place-items-center rounded-btn border border-line-2 text-ink-2"
          >
            <RotateCcw size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4 flex justify-center gap-2" aria-hidden="true">
          {[1, 2, 3, 4].map((i) => (
            <span
              className="h-2 w-6 rounded-chip"
              key={i}
              style={{ background: i <= session ? "var(--blue)" : "var(--line-2)" }}
            />
          ))}
        </div>
      </section>

      <section className="card p-4" aria-label="Three tasks for today">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-ink">Three tasks for today</h2>
          <span className="num text-[13px] text-ink-3">{doneToday} closed</span>
        </div>
        <div className="mt-1 divide-y divide-line">
          {focus.length === 0 ? (
            <p className="py-4 text-sm text-ink-2">
              The list is empty. Pick tasks from the pool below.
            </p>
          ) : (
            focus.map((t) => (
              <TaskRow
                key={t.id}
                task={t}
                hub={hubs.find((h) => h.id === t.hub_id)}
                onToggle={() => completeTask.mutate(t)}
                right={
                  <button
                    type="button"
                    aria-label={`Remove ${t.title} from today`}
                    onClick={() => patchTask.mutate({ id: t.id, patch: { is_today: false } })}
                    className="min-h-11 px-2 text-[13px] font-bold"
                    style={{ color: "var(--blue-ink)" }}
                  >
                    Remove
                  </button>
                }
              />
            ))
          )}
        </div>
      </section>

      <section className="card p-4" aria-label="Add to today">
        <h2 className="text-base font-extrabold text-ink">Add to today</h2>
        <ul className="mt-2 space-y-2">
          {pool.length === 0 ? (
            <li className="text-sm text-ink-2">No free tasks left.</li>
          ) : (
            pool.map((t) => (
              <li key={t.id} className="flex items-center gap-3">
                <span className="min-w-0 flex-1 truncate text-[15px] text-ink">{t.title}</span>
                <button
                  type="button"
                  aria-label={`Add ${t.title} to today`}
                  onClick={() => patchTask.mutate({ id: t.id, patch: { is_today: true } })}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-btn border border-line-2"
                  style={{ color: "var(--blue-ink)" }}
                >
                  <Plus size={18} aria-hidden="true" />
                </button>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
