import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, MoreHorizontal } from "lucide-react";
import { Lumi } from "@/components/Lumi";
import { Sheet } from "@/components/Sheet";
import { TaskCheck } from "@/components/TaskRow";
import {
  announce,
  hubColor,
  todayISO,
  useHubs,
  useTaskMutations,
  useTasks,
  type Task,
} from "@/lib/app";

export const Route = createFileRoute("/day")({
  head: () => ({
    meta: [
      { title: "Today — Luvion" },
      {
        name: "description",
        content:
          "A real 25 minute focus timer with Lumi inside the ring and three numbered slots for the tasks of today.",
      },
      { property: "og:title", content: "Today — Luvion" },
      {
        property: "og:description",
        content: "Focus sessions of 25 minutes and three slots for today.",
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

  const [poolOpen, setPoolOpen] = useState(false);
  const [menuTask, setMenuTask] = useState<Task | null>(null);
  const [swapCandidate, setSwapCandidate] = useState<Task | null>(null);

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
  const focusOpen = tasks.filter((t) => t.is_today && !t.is_done);
  const closedToday = tasks.filter(
    (t) => t.is_done && t.done_at?.slice(0, 10) === today,
  );
  const pool = tasks.filter((t) => !t.is_today && !t.is_done);
  const slots: (Task | null)[] = [0, 1, 2].map((i) => focusOpen[i] ?? null);
  const full = focusOpen.length >= 3;

  const pick = (task: Task) => {
    if (full) {
      setPoolOpen(false);
      setSwapCandidate(task);
      return;
    }
    patchTask.mutate({ id: task.id, patch: { is_today: true } });
    setPoolOpen(false);
  };

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
          <span className="num text-[13px] text-ink-3">{closedToday.length} closed</span>
        </div>
        <p className="mt-1 text-[13px] text-ink-2">
          Three slots, no more. A fourth task takes the place of one of these.
        </p>

        <ol className="mt-2 divide-y divide-line">
          {slots.map((task, i) => (
            <li key={i} className="flex items-center gap-3 py-2.5">
              <span
                className="num grid h-7 w-7 shrink-0 place-items-center rounded-chip border border-line-2 text-[13px] font-bold text-ink-3"
                aria-hidden="true"
              >
                {i + 1}
              </span>
              {task ? (
                <>
                  <TaskCheck
                    checked={task.is_done}
                    onToggle={() => completeTask.mutate(task)}
                    label={`Mark ${task.title} done`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-medium text-ink">
                      {task.title}
                    </span>
                    {(() => {
                      const hub = hubs.find((h) => h.id === task.hub_id);
                      return hub ? (
                        <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-ink-2">
                          <span
                            className="h-2 w-2 rounded-chip"
                            style={{ background: hubColor(hub.color) }}
                            aria-hidden="true"
                          />
                          {hub.name}
                        </span>
                      ) : null;
                    })()}
                  </span>
                  <button
                    type="button"
                    aria-label={`More actions for ${task.title}`}
                    onClick={() => setMenuTask(task)}
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-btn text-ink-3"
                  >
                    <MoreHorizontal size={18} aria-hidden="true" />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setPoolOpen(true)}
                  className="min-h-11 min-w-0 flex-1 text-left text-[15px] font-medium"
                  style={{ color: "var(--blue-ink)" }}
                >
                  Pick from your tasks
                </button>
              )}
            </li>
          ))}
        </ol>
      </section>

      <section className="card p-4" aria-label="Closed today">
        <h2 className="text-base font-extrabold text-ink">Closed today</h2>
        <ul className="mt-2 space-y-2">
          {closedToday.length === 0 ? (
            <li className="text-sm text-ink-2">Nothing closed yet today.</li>
          ) : (
            closedToday.map((t) => (
              <li key={t.id} className="flex items-center gap-3">
                <TaskCheck
                  checked
                  onToggle={() => completeTask.mutate(t)}
                  label={`Reopen ${t.title}`}
                />
                <span className="strike min-w-0 flex-1 truncate text-[15px] text-ink-3">
                  {t.title}
                </span>
              </li>
            ))
          )}
        </ul>
      </section>

      <Sheet open={poolOpen} onClose={() => setPoolOpen(false)} title="Pick from your tasks">
        <ul className="space-y-2">
          {pool.length === 0 ? (
            <li className="text-sm text-ink-2">No free tasks left. New ones are created in Hubs.</li>
          ) : (
            pool.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => pick(t)}
                  className="min-h-11 w-full rounded-btn border border-line-2 px-3 text-left text-[15px] text-ink"
                >
                  {t.title}
                </button>
              </li>
            ))
          )}
        </ul>
      </Sheet>

      <Sheet
        open={menuTask !== null}
        onClose={() => setMenuTask(null)}
        title={menuTask?.title ?? "Task"}
      >
        <button
          type="button"
          onClick={() => {
            if (menuTask) patchTask.mutate({ id: menuTask.id, patch: { is_today: false } });
            setMenuTask(null);
          }}
          className="min-h-11 w-full rounded-btn border border-line-2 text-sm font-bold"
          style={{ color: "var(--blue-ink)" }}
        >
          Remove from today
        </button>
        <button
          type="button"
          onClick={() => setMenuTask(null)}
          className="mt-2 min-h-11 w-full rounded-btn border border-line-2 text-sm font-bold text-ink-2"
        >
          Cancel
        </button>
      </Sheet>

      <Sheet
        open={swapCandidate !== null}
        onClose={() => setSwapCandidate(null)}
        title="All three slots are taken"
      >
        <p className="text-[14px] leading-relaxed text-ink-2">
          To add {swapCandidate?.title}, pick the task that leaves today. It stays in its hub and
          keeps everything it has.
        </p>
        <ul className="mt-3 space-y-2">
          {focusOpen.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => {
                  patchTask.mutate({ id: t.id, patch: { is_today: false } });
                  if (swapCandidate)
                    patchTask.mutate({ id: swapCandidate.id, patch: { is_today: true } });
                  setSwapCandidate(null);
                }}
                className="min-h-11 w-full rounded-btn border border-line-2 px-3 text-left text-[15px] text-ink"
              >
                Replace {t.title}
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => setSwapCandidate(null)}
          className="mt-3 min-h-11 w-full rounded-btn border border-line-2 text-sm font-bold text-ink-2"
        >
          Keep today as it is
        </button>
      </Sheet>
    </div>
  );
}
