import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, FileText } from "lucide-react";
import { Sheet } from "@/components/Sheet";
import { DataError } from "@/components/DataError";
import { BoardSkeleton, HubDetailSkeleton } from "@/components/skeletons";
import { useDelayedFlag } from "@/hooks/useDelayedFlag";
import { TaskRow } from "@/components/TaskRow";
import { TaskSheet } from "@/components/TaskSheet";
import { DocEditor } from "@/components/DocEditor";
import { BoundaryCard } from "@/components/BoundaryCard";
import { LIMITS, TIER_LABEL, isBoundaryHidden, useBilling } from "@/lib/billing";
import {
  COLUMNS,
  WIP_LIMIT,
  DOC_TEMPLATES,
  type DocTemplateKey,
  announce,
  hubColor,
  type BoardColumn,
  PRIORITY_LABEL,
  type Priority,
  type Task,
  useDocMutations,
  useDocs,
  useHubs,
  useTaskMutations,
  useTasks,
} from "@/lib/app";


export const Route = createFileRoute("/hubs/$hubId")({
  head: () => ({
    meta: [
      { title: "Hub — Luvion" },
      {
        name: "description",
        content:
          "Inside a Luvion hub: the task list, the column board and the block docs of that area.",
      },
      { property: "og:title", content: "Hub — Luvion" },
      {
        property: "og:description",
        content: "Tasks, the board and docs of the selected area.",
      },
    ],
  }),
  component: HubScreen,
});

type Segment = "tasks" | "board" | "docs";

function HubScreen() {
  const { hubId } = useParams({ from: "/hubs/$hubId" });
  const hubsQ = useHubs();
  const tasksQ = useTasks();
  const docsQ = useDocs();
  const hubs = hubsQ.data ?? [];
  const tasks = tasksQ.data ?? [];
  const docs = docsQ.data ?? [];
  const loading = hubsQ.isLoading || tasksQ.isLoading || docsQ.isLoading;
  const failed = hubsQ.isError || tasksQ.isError || docsQ.isError;
  const showSkeleton = useDelayedFlag(loading);
  const { createTask, completeTask, moveTask } = useTaskMutations();
  const { createDoc, removeDoc } = useDocMutations();

  const [segment, setSegment] = useState<Segment>("tasks");
  const [openTask, setOpenTask] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("p2");
  const [isToday, setIsToday] = useState(false);
  const [error, setError] = useState("");
  const [openDocId, setOpenDocId] = useState<string | null>(null);
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [boardBoundary, setBoardBoundary] = useState(false);
  const [wipCandidate, setWipCandidate] = useState<Task | null>(null);
  const [openDocPicker, setOpenDocPicker] = useState(false);
  const { billing } = useBilling();

  const hub = hubs.find((h) => h.id === hubId);
  const hubTasks = tasks.filter((t) => t.hub_id === hubId);
  const hubDocs = docs.filter((d) => d.hub_id === hubId);
  const openDoc = hubDocs.find((d) => d.id === openDocId);
  const doingTasks = hubTasks.filter((t) => t.board_column === "doing");

  const moveToColumn = (task: Task, column: BoardColumn) => {
    if (column === "doing" && doingTasks.length >= WIP_LIMIT) {
      setWipCandidate(task);
      return;
    }
    moveTask.mutate({ task, column });
  };

  const swapIntoDoing = async (outgoing: Task) => {
    const incoming = wipCandidate;
    if (!incoming) return;
    await moveTask.mutateAsync({ task: outgoing, column: "backlog" });
    await moveTask.mutateAsync({ task: incoming, column: "doing" });
    setWipCandidate(null);
    announce(`${incoming.title} started, ${outgoing.title} moved back to Backlog`);
  };
  const boardLimit = LIMITS[billing.tier].boards;
  const boardAllowed =
    boardLimit === null || hubs.slice(0, boardLimit).some((h) => h.id === hubId);


  if (loading)
    return showSkeleton ? (
      segment === "board" ? <BoardSkeleton /> : <HubDetailSkeleton />
    ) : null;
  if (failed)
    return (
      <DataError
        error={hubsQ.error ?? tasksQ.error ?? docsQ.error}
        onRetry={() => {
          hubsQ.refetch();
          tasksQ.refetch();
          docsQ.refetch();
        }}
        what="this hub"
      />
    );

  if (!hub) {
    return (
      <div className="cascade space-y-3">
        <Link to="/hubs" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold" style={{ color: "var(--blue-ink)" }}>
          <ArrowLeft size={18} aria-hidden="true" /> Back to hubs
        </Link>
        <p className="card p-4 text-sm text-ink-2">
          This hub was not found — it was deleted or the link is out of date. Go back to the hub list.
        </p>
      </div>
    );
  }

  return (
    <div className="cascade space-y-4">
      <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
        <Link
          to="/hubs"
          aria-label="Back to the hub list"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-btn border border-line-2 text-ink-2"
        >
          <ArrowLeft size={18} aria-hidden="true" />
        </Link>
        <div className="min-w-0">
          <p className="label-xs text-ink-3">Hub</p>
          <h1 className="t-screen truncate text-ink">{hub.name}</h1>
        </div>
        <span
          className="h-9 w-9 shrink-0 rounded-tile"
          style={{ background: hubColor(hub.color) }}
          aria-hidden="true"
        />
      </header>

      <div
        role="tablist"
        aria-label="Hub sections"
        className="grid grid-cols-3 gap-1 rounded-btn border border-line bg-paper p-1"
      >
        {(
          [
            ["tasks", "Tasks"],
            ["board", boardAllowed ? "Board" : "Board · 1 of 1"],
            ["docs", "Docs"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={segment === key}
            onClick={() => {
              if (key === "board" && !boardAllowed) {
                setBoardBoundary(true);
                return;
              }
              setSegment(key);
            }}
            className="min-h-11 rounded-[12px] t-aux font-bold"
            style={{
              background:
                segment === key
                  ? "color-mix(in oklab, var(--blue) 12%, transparent)"
                  : "transparent",
              color: segment === key ? "var(--blue-ink)" : "var(--ink-2)",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {boardBoundary && !isBoundaryHidden("board-limit") ? (
        <BoundaryCard
          id="board-limit"
          left={`${TIER_LABEL[billing.tier]} includes one board, and the first hub already uses it.`}
          stops="the column board in this hub"
          continues="the tasks and docs of this hub, the first hub board, the halo and the focus timer"
          onDismiss={() => setBoardBoundary(false)}
        />
      ) : null}



      {segment === "tasks" ? (
        <section className="card p-4" aria-label="Hub tasks">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <h2 className="truncate t-title text-ink">Tasks</h2>
            <button
              type="button"
              aria-label="Add task"
              onClick={() => setOpenTask(true)}
              className="ring-on-solid grid h-11 w-11 shrink-0 place-items-center rounded-btn bg-blue-btn text-white"
            >
              <Plus size={18} aria-hidden="true" />
            </button>
          </div>
          <div className="surface-sunk mt-1 divide-y divide-line px-3">
            {hubTasks.length === 0 ? (
              <div className="py-4">
                <p className="text-sm text-ink-2">No tasks yet in this hub.</p>
                <button
                  type="button"
                  onClick={() => setOpenTask(true)}
                  className="ring-on-solid mt-3 min-h-11 w-full rounded-btn bg-blue-btn text-sm font-bold text-white"
                >
                  New task
                </button>
              </div>
            ) : (
              hubTasks.map((t) => (
                <TaskRow
                  key={t.id}
                  task={t}
                  onToggle={() => completeTask.mutate(t)}
                  onOpen={() => setDetailTask(t)}
                />
              ))
            )}
          </div>
        </section>
      ) : null}


      {segment === "board" ? (
        <section aria-label="Task board">
          <div className="snap-x-cols no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
            {COLUMNS.map((col) => {
              const items = hubTasks.filter((t) => t.board_column === col.key);
              const idx = COLUMNS.findIndex((c) => c.key === col.key);
              return (
                <div key={col.key} className="snap-col w-[80%] shrink-0">
                  <div className="card h-full p-3">
                    <div className="flex items-center justify-between">
                      <h2 className="t-title text-ink">{col.label}</h2>
                      {col.key === "doing" ? (
                        <span
                          className="num t-aux"
                          style={{
                            color:
                              items.length >= WIP_LIMIT ? "var(--halo-tx)" : "var(--ink-3)",
                          }}
                        >
                          {items.length} / {WIP_LIMIT}
                        </span>
                      ) : (
                        <span className="num t-aux text-ink-3">{items.length}</span>
                      )}
                    </div>
                    {col.key === "doing" && items.length >= WIP_LIMIT ? (
                      <p className="mt-1 t-aux text-ink-2">
                        Three at a time. A fourth card takes the place of one of these.
                      </p>
                    ) : null}
                    <ul className="mt-3 space-y-2">
                      {items.length === 0 ? (
                        <li className="t-aux text-ink-3">Empty</li>
                      ) : null}
                      {items.map((t) => (
                        <li
                          key={t.id}
                          className="rounded-tile border border-line bg-bg p-3"
                        >
                          <p className="t-body text-ink">{t.title}</p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="label-xs text-ink-3">{PRIORITY_LABEL[t.priority]}</span>
                            <span className="flex gap-1">
                              <button
                                type="button"
                                aria-label={`Move ${t.title} one column left`}
                                disabled={idx === 0}
                                onClick={() =>
                                  moveToColumn(t, COLUMNS[idx - 1]!.key as BoardColumn)
                                }
                                className="grid h-11 w-11 place-items-center rounded-btn border border-line-2 disabled:opacity-40"
                                style={{ color: "var(--blue-ink)" }}
                              >
                                <ChevronLeft size={16} aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                aria-label={`Move ${t.title} one column right`}
                                disabled={idx === COLUMNS.length - 1}
                                onClick={() =>
                                  moveToColumn(t, COLUMNS[idx + 1]!.key as BoardColumn)
                                }
                                className="grid h-11 w-11 place-items-center rounded-btn border border-line-2 disabled:opacity-40"
                                style={{ color: "var(--blue-ink)" }}
                              >
                                <ChevronRight size={16} aria-hidden="true" />
                              </button>
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {segment === "docs" ? (
        openDoc ? (
          <DocEditor doc={openDoc} onBack={() => setOpenDocId(null)} />
        ) : (
          <section className="card p-4" aria-label="Hub docs">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <h2 className="truncate t-title text-ink">Docs</h2>
              <button
                type="button"
                aria-label="Create doc"
                onClick={() => setOpenDocPicker(true)}
                className="ring-on-solid grid h-11 w-11 shrink-0 place-items-center rounded-btn bg-blue-btn text-white"
              >
                <Plus size={18} aria-hidden="true" />
              </button>
            </div>
            <ul className="surface-sunk mt-2 divide-y divide-line px-3">
              {hubDocs.length === 0 ? (
                <li className="py-4">
                  <p className="text-sm text-ink-2">No docs yet in this hub.</p>
                  <button
                    type="button"
                    onClick={() => setOpenDocPicker(true)}
                    className="ring-on-solid mt-3 min-h-11 w-full rounded-btn bg-blue-btn text-sm font-bold text-white"
                  >
                    New doc
                  </button>
                </li>
              ) : null}

              {hubDocs.map((d) => (
                <li key={d.id} className="flex items-center gap-2 py-2">
                  <button
                    type="button"
                    onClick={() => setOpenDocId(d.id)}
                    className="flex min-h-11 min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    <FileText size={18} className="shrink-0 text-ink-3" aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="block truncate t-body text-ink">
                        {d.title}
                      </span>
                      <span className="num block label-xs text-ink-3">
                        {d.blocks?.length ?? 0} blocks
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete doc ${d.title}`}
                    onClick={() => removeDoc.mutate(d.id)}
                    className="min-h-11 px-2 t-aux font-bold"
                    style={{ color: "var(--coral-tx)" }}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )
      ) : null}

      <Sheet
        open={wipCandidate !== null}
        onClose={() => setWipCandidate(null)}
        title="Three cards are already in progress"
      >
        <div className="space-y-3">
          <p className="text-sm text-ink-2">
            To start {wipCandidate?.title}, pick the card that goes back to Backlog.
          </p>
          <ul className="space-y-2">
            {doingTasks.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => swapIntoDoing(t)}
                  className="min-h-12 w-full rounded-btn border border-line-2 px-3 text-left t-body text-ink"
                >
                  Move {t.title} back
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setWipCandidate(null)}
            className="min-h-12 w-full rounded-btn border border-line-2 text-sm font-bold text-ink-2"
          >
            Keep the board as it is
          </button>
        </div>
      </Sheet>

      <Sheet
        open={openDocPicker}
        onClose={() => setOpenDocPicker(false)}
        title="New document"
      >
        <ul className="space-y-2">
          {DOC_TEMPLATES.map((tpl) => (
            <li key={tpl.key}>
              <button
                type="button"
                onClick={async () => {
                  const created = await createDoc.mutateAsync({
                    hub_id: hub.id,
                    template: tpl.key as DocTemplateKey,
                  });
                  setOpenDocPicker(false);
                  setSegment("docs");
                  setOpenDocId(created.id);
                  announce(`${tpl.name} created`);
                }}
                className="min-h-16 w-full rounded-btn border border-line-2 px-3 py-2 text-left"
              >
                <span className="block t-body font-bold text-ink">{tpl.name}</span>
                <span className="block t-aux text-ink-2">{tpl.description}</span>
              </button>
            </li>
          ))}
        </ul>
      </Sheet>

      <TaskSheet task={detailTask} onClose={() => setDetailTask(null)} />

      <Sheet open={openTask} onClose={() => setOpenTask(false)} title="New task">
        <div className="space-y-3">
          <label className="block">
            <span className="label-xs text-ink-3">Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 min-h-11 w-full rounded-btn border border-line-2 bg-bg px-3 text-ink"
              placeholder="What needs doing"
            />
          </label>
          <fieldset>
            <legend className="label-xs text-ink-3">Priority</legend>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(["p1", "p2", "p3"] as Priority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  aria-pressed={priority === p}
                  onClick={() => setPriority(p)}
                  className="min-h-11 rounded-btn border text-sm font-bold"
                  style={{
                    borderColor: priority === p ? "var(--blue)" : "var(--line-2)",
                    color: priority === p ? "var(--blue-ink)" : "var(--ink-2)",
                  }}
                >
                  {PRIORITY_LABEL[p]}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="flex items-center justify-between gap-4">
            <span className="t-body font-bold text-ink">Add to today</span>
            <button
              type="button"
              role="switch"
              aria-checked={isToday}
              aria-label="Add to today"
              onClick={() => setIsToday((v) => !v)}
              className="relative h-11 w-16 shrink-0 rounded-chip border border-line-2 px-1"
              style={{ background: isToday ? "var(--blue-btn)" : "var(--bg)" }}
            >
              <span
                className="block h-7 w-7 rounded-chip bg-paper transition-transform"
                style={{ transform: isToday ? "translateX(28px)" : "translateX(0)" }}
              />
            </button>
          </div>
          {error ? (
            <p className="t-aux" style={{ color: "var(--coral-tx)" }}>
              {error}
            </p>
          ) : null}
          <button
            type="button"
            onClick={async () => {
              if (!title.trim()) {
                setError("The title is empty. Enter a task title.");
                return;
              }
              try {
                await createTask.mutateAsync({
                  title: title.trim(),
                  hub_id: hub.id,
                  priority,
                  is_today: isToday,
                });
                setTitle("");
                setIsToday(false);
                setError("");
                setOpenTask(false);
              } catch (e) {
                setError(`Couldn't create the task — ${(e as Error).message}. Try again.`);
              }
            }}
            className="ring-on-solid min-h-11 w-full rounded-btn bg-blue-btn text-sm font-bold text-white"
          >
            Add task
          </button>
        </div>
      </Sheet>
    </div>
  );
}
