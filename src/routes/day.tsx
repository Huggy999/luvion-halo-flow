import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Pause, Play, MoreHorizontal, SkipForward, Check } from "lucide-react";
import { Button } from "@/components/Button";
import { Lumi } from "@/components/Lumi";
import { HaloRing } from "@/components/HaloRing";
import { DataError } from "@/components/DataError";
import { DaySkeleton } from "@/components/skeletons";
import { useDelayedFlag } from "@/hooks/useDelayedFlag";
import { Sheet } from "@/components/Sheet";
import { TaskCheck } from "@/components/TaskRow";
import { TaskSheet } from "@/components/TaskSheet";
import { markFirstSessionDone } from "@/lib/pwa";
import {
  announce,
  haloSkin,
  hubColor,
  offerUndo,
  todayISO,
  useAppState,
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
          "A real 25 minute focus timer tied to one of the three tasks of today, with Lumi inside the ring.",
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
  const tasksQ = useTasks();
  const hubsQ = useHubs();
  const stateQ = useAppState();
  const tasks = tasksQ.data ?? [];
  const hubs = hubsQ.data ?? [];
  const state = stateQ.data;
  const loading = tasksQ.isLoading || hubsQ.isLoading || stateQ.isLoading;
  const failed = tasksQ.isError || hubsQ.isError || stateQ.isError;
  const showSkeleton = useDelayedFlag(loading);
  const { completeTask, patchTask } = useTaskMutations();

  const [left, setLeft] = useState(FOCUS_SECONDS);
  const [running, setRunning] = useState(false);
  const [session, setSession] = useState(1);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [doneOpen, setDoneOpen] = useState(false);
  const [breakOpen, setBreakOpen] = useState(false);
  const tick = useRef<number | null>(null);

  const [poolOpen, setPoolOpen] = useState(false);
  const [pickForFocus, setPickForFocus] = useState(false);
  const [menuTask, setMenuTask] = useState<Task | null>(null);
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [swapCandidate, setSwapCandidate] = useState<Task | null>(null);

  const today = todayISO();
  const focusOpen = tasks.filter((t) => t.is_today && !t.is_done);
  const closedToday = tasks.filter((t) => t.is_done && t.done_at?.slice(0, 10) === today);
  const pool = tasks.filter((t) => !t.is_today && !t.is_done);
  const slots: (Task | null)[] = [0, 1, 2].map((i) => focusOpen[i] ?? null);
  const full = focusOpen.length >= 3;
  const activeTask = focusOpen.find((t) => t.id === activeId) ?? null;

  useEffect(() => {
    if (activeId && !focusOpen.some((t) => t.id === activeId)) {
      setActiveId(null);
      setRunning(false);
      setLeft(FOCUS_SECONDS);
    }
  }, [activeId, focusOpen]);

  useEffect(() => {
    if (!running) return;
    tick.current = window.setInterval(() => {
      setLeft((prev) => {
        if (prev <= 1) {
          setRunning(false);
          setDoneOpen(true);
          markFirstSessionDone();
          announce("Focus session finished");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (tick.current) window.clearInterval(tick.current);
    };
  }, [running]);

  const pick = (task: Task) => {
    if (pickForFocus) {
      setActiveId(task.id);
      setPickForFocus(false);
      setPoolOpen(false);
      setLeft(FOCUS_SECONDS);
      return;
    }
    if (full) {
      setPoolOpen(false);
      setSwapCandidate(task);
      return;
    }
    patchTask.mutate({ id: task.id, patch: { is_today: true } });
    setPoolOpen(false);
  };

  const nextSession = () => {
    setLeft(FOCUS_SECONDS);
    setDoneOpen(false);
    if (session >= 4) {
      setSession(1);
      setBreakOpen(true);
      return;
    }
    setSession((s) => s + 1);
    setRunning(true);
  };

  const progress = 1 - left / FOCUS_SECONDS;
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const streak = state?.streak ?? 0;

  if (loading) return showSkeleton ? <DaySkeleton /> : null;
  if (failed)
    return (
      <DataError
        error={tasksQ.error ?? hubsQ.error ?? stateQ.error}
        onRetry={() => {
          tasksQ.refetch();
          hubsQ.refetch();
          stateQ.refetch();
        }}
        what="today"
      />
    );

  return (
    <div className="cascade space-y-4">
      <header>
        <p className="label-xs text-ink-3">Focus · Session {session} of 4</p>
        <h1 className="t-screen mt-1 text-ink">Today</h1>
      </header>

      <section className="card p-5" aria-label="Focus timer">
        <div className="mx-auto w-56">
          <HaloRing skin={haloSkin(streak)} progress={progress} size={224} breathe={running}>
            <div className="flex flex-col items-center justify-center gap-1">
              <Lumi variant={running ? "glow" : "sleep"} size={70} breathe={running} />
              <p className="t-hero text-ink">
                {mm}:{ss}
              </p>
            </div>
          </HaloRing>
        </div>

        <p className="mt-4 text-center t-title text-ink">
          {activeTask ? activeTask.title : "No task picked for this session"}
        </p>

        {activeTask ? (
          <div className="mt-5 flex items-center justify-center gap-2">
            <Button variant="primary" onClick={() => setRunning((r) => !r)}>
              {running ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
              {running ? "Pause" : left === FOCUS_SECONDS ? "Start focus" : "Resume"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setRunning(false);
                setLeft(FOCUS_SECONDS);
                setActiveId(null);
                announce("Session skipped");
              }}
            >
              <SkipForward size={18} aria-hidden="true" />
              Skip
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setRunning(false);
                completeTask.mutate(activeTask);
                markFirstSessionDone();
                setActiveId(null);
                setLeft(FOCUS_SECONDS);
              }}
              style={{ color: "var(--mint-tx)" }}
            >
              <Check size={18} aria-hidden="true" />
              Complete
            </Button>
          </div>
        ) : (
          <div className="mt-5 space-y-2">
            <p className="text-center t-aux text-ink-2">
              A session runs on one task. Pick one of the three slots of today.
            </p>
            {focusOpen.length === 0 ? (
              <Button variant="primary" block onClick={() => {
                setPickForFocus(false);
                setPoolOpen(true);
              }}>
                Pick from your tasks
              </Button>
            ) : (
              focusOpen.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setActiveId(t.id);
                    setLeft(FOCUS_SECONDS);
                  }}
                  className="min-h-11 w-full rounded-btn border border-[var(--line-ctl)] px-3 text-left t-body text-ink"
                >
                  {i + 1}. {t.title}
                </button>
              ))
            )}
          </div>
        )}

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
          <h2 className="t-title text-ink">Three tasks for today</h2>
          <span className="num t-aux text-ink-3">{closedToday.length} closed</span>
        </div>
        <p className="mt-1 t-aux text-ink-2">
          Three slots, no more. A fourth task takes the place of one of these.
        </p>

        <ol className="surface-sunk mt-2 divide-y divide-line px-3">
          {slots.map((task, i) => (
            <li key={i} className="flex items-center gap-3 py-2.5">
              <span
                className="num grid h-7 w-7 shrink-0 place-items-center rounded-chip border border-line-2 t-aux font-bold text-ink-3"
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
                  <button
                    type="button"
                    onClick={() => setDetailTask(task)}
                    className="min-w-0 flex-1 py-1 text-left"
                  >
                    <span className="block truncate t-body text-ink">
                      {task.title}
                    </span>
                    {(() => {
                      const hub = hubs.find((h) => h.id === task.hub_id);
                      return hub ? (
                        <span className="mt-0.5 flex items-center gap-1.5 label-xs text-ink-2">
                          <span
                            className="h-2 w-2 rounded-chip"
                            style={{ background: hubColor(hub.color) }}
                            aria-hidden="true"
                          />
                          {hub.name}
                        </span>
                      ) : null;
                    })()}
                  </button>
                  <button
                    type="button"
                    aria-label={`More actions for ${task.title}`}
                    onClick={() => setMenuTask(task)}
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-btn border border-[var(--line-ctl)] text-ink-3"
                  >
                    <MoreHorizontal size={18} aria-hidden="true" />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setPickForFocus(false);
                    setPoolOpen(true);
                  }}
                  className="min-h-11 min-w-0 flex-1 text-left t-body"
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
        <h2 className="t-title text-ink">Closed today</h2>
        <ul className="mt-2 space-y-2">
          {closedToday.length === 0 ? (
            <li className="t-body font-normal text-ink-2">Nothing closed yet today.</li>
          ) : (
            closedToday.map((t) => (
              <li key={t.id} className="flex items-center gap-3">
                <TaskCheck
                  checked
                  onToggle={() => completeTask.mutate(t)}
                  label={`Reopen ${t.title}`}
                />
                <span className="strike min-w-0 flex-1 truncate t-body text-ink-3">
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
            <li className="t-body font-normal text-ink-2">
              No free tasks left. Create one with the plus button.
            </li>
          ) : (
            pool.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => pick(t)}
                  className="min-h-11 w-full rounded-btn border border-[var(--line-ctl)] px-3 text-left t-body text-ink"
                >
                  {t.title}
                </button>
              </li>
            ))
          )}
        </ul>
      </Sheet>

      <Sheet
        open={doneOpen}
        onClose={() => setDoneOpen(false)}
        title={activeTask ? `Session done. Close "${activeTask.title}"` : "Session done"}
      >
        <div className="space-y-2">
          <Button
            variant="primary"
            size="lg"
            block
            onClick={() => {
              if (activeTask) completeTask.mutate(activeTask);
              setActiveId(null);
              setLeft(FOCUS_SECONDS);
              setSession((s) => (s >= 4 ? 1 : s + 1));
              setDoneOpen(false);
            }}
          >
            Close task
          </Button>
          <Button variant="secondary" size="lg" block onClick={nextSession}>
            One more session
          </Button>
          <Button
            variant="secondary"
            size="lg"
            block
            onClick={() => {
              setLeft(FOCUS_SECONDS);
              setDoneOpen(false);
              setBreakOpen(true);
            }}
          >
            Take a break
          </Button>
        </div>
      </Sheet>

      <Sheet open={breakOpen} onClose={() => setBreakOpen(false)} title="Time for a break">
        <p className="t-body font-normal text-ink-2">
          {session >= 4
            ? "Four sessions are done. A longer break of fifteen minutes fits well here."
            : "Step away for five minutes. The timer waits at twenty five minutes."}
        </p>
        <Button variant="secondary" size="lg" block className="mt-3" onClick={() => setBreakOpen(false)}>
          Back to Today
        </Button>
      </Sheet>

      <Sheet
        open={menuTask !== null}
        onClose={() => setMenuTask(null)}
        title={menuTask?.title ?? "Task"}
      >
        <Button
          variant="secondary"
          block
          onClick={() => {
            if (menuTask) {
              setActiveId(menuTask.id);
              setLeft(FOCUS_SECONDS);
            }
            setMenuTask(null);
          }}
        >
          Focus on this task
        </Button>
        <Button
          variant="secondary"
          block
          className="mt-2"
          onClick={() => {
            if (menuTask) {
              const t = menuTask;
              patchTask.mutate({ id: t.id, patch: { is_today: false } });
              offerUndo({
                message: `${t.title} removed from today`,
                onUndo: () => patchTask.mutate({ id: t.id, patch: { is_today: true } }),
              });
            }
            setMenuTask(null);
          }}
        >
          Remove from today
        </Button>
        <Button variant="ghost" block className="mt-2" onClick={() => setMenuTask(null)}>
          Cancel
        </Button>
      </Sheet>

      <TaskSheet task={detailTask} onClose={() => setDetailTask(null)} />

      <Sheet
        open={swapCandidate !== null}
        onClose={() => setSwapCandidate(null)}
        title="All three slots are taken"
      >
        <p className="t-body font-normal text-ink-2">
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
                className="min-h-11 w-full rounded-btn border border-[var(--line-ctl)] px-3 text-left t-body text-ink"
              >
                Replace {t.title}
              </button>
            </li>
          ))}
        </ul>
        <Button variant="ghost" block className="mt-3" onClick={() => setSwapCandidate(null)}>
          Keep today as it is
        </Button>
      </Sheet>
    </div>
  );
}
