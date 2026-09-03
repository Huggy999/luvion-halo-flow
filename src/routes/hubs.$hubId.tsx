import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, FileText } from "lucide-react";
import { Sheet } from "@/components/Sheet";
import { TaskRow } from "@/components/TaskRow";
import { DocEditor } from "@/components/DocEditor";
import { BoundaryCard } from "@/components/BoundaryCard";
import { LIMITS, TIER_LABEL, isBoundaryHidden, useBilling } from "@/lib/billing";
import {
  COLUMNS,
  hubColor,
  type BoardColumn,
  type Priority,
  useDocMutations,
  useDocs,
  useHubs,
  useTaskMutations,
  useTasks,
} from "@/lib/app";


export const Route = createFileRoute("/hubs/$hubId")({
  head: () => ({
    meta: [
      { title: "Хаб — Luvion" },
      {
        name: "description",
        content:
          "Внутри хаба Luvion: список задач, доска по колонкам и блочные документы направления.",
      },
      { property: "og:title", content: "Хаб — Luvion" },
      {
        property: "og:description",
        content: "Задачи, доска и документы выбранного направления.",
      },
    ],
  }),
  component: HubScreen,
});

type Segment = "tasks" | "board" | "docs";

function HubScreen() {
  const { hubId } = useParams({ from: "/hubs/$hubId" });
  const { data: hubs = [] } = useHubs();
  const { data: tasks = [] } = useTasks();
  const { data: docs = [] } = useDocs();
  const { createTask, completeTask, moveTask } = useTaskMutations();
  const { createDoc, removeDoc } = useDocMutations();

  const [segment, setSegment] = useState<Segment>("tasks");
  const [openTask, setOpenTask] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("p2");
  const [isToday, setIsToday] = useState(false);
  const [error, setError] = useState("");
  const [openDocId, setOpenDocId] = useState<string | null>(null);

  const hub = hubs.find((h) => h.id === hubId);
  const hubTasks = tasks.filter((t) => t.hub_id === hubId);
  const hubDocs = docs.filter((d) => d.hub_id === hubId);
  const openDoc = hubDocs.find((d) => d.id === openDocId);

  if (!hub) {
    return (
      <div className="cascade space-y-3">
        <Link to="/hubs" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold" style={{ color: "var(--blue-ink)" }}>
          <ArrowLeft size={18} aria-hidden="true" /> К хабам
        </Link>
        <p className="card p-4 text-sm text-ink-2">
          Хаб не найден: он был удалён или ссылка устарела. Вернитесь к списку хабов.
        </p>
      </div>
    );
  }

  return (
    <div className="cascade space-y-4">
      <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
        <Link
          to="/hubs"
          aria-label="К списку хабов"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-btn border border-line-2 text-ink-2"
        >
          <ArrowLeft size={18} aria-hidden="true" />
        </Link>
        <div className="min-w-0">
          <p className="label-xs text-ink-3">Хаб</p>
          <h1 className="screen-title truncate text-[24px] leading-tight text-ink">{hub.name}</h1>
        </div>
        <span
          className="h-9 w-9 shrink-0 rounded-tile"
          style={{ background: hubColor(hub.color) }}
          aria-hidden="true"
        />
      </header>

      <div
        role="tablist"
        aria-label="Разделы хаба"
        className="grid grid-cols-3 gap-1 rounded-btn border border-line bg-paper p-1"
      >
        {(
          [
            ["tasks", "Задачи"],
            ["board", boardAllowed ? "Доска" : `Доска · 1 из 1`],
            ["docs", "Документы"],
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
            className="min-h-11 rounded-[12px] text-[13px] font-bold"
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
          left={`Доска на тарифе ${TIER_LABEL[billing.tier]} одна и уже занята первым хабом.`}
          stops="доска по колонкам в этом хабе"
          continues="задачи и документы этого хаба, доска первого хаба, серия и фокус-таймер"
          onDismiss={() => setBoardBoundary(false)}
        />
      ) : null}



      {segment === "tasks" ? (
        <section className="card p-4" aria-label="Задачи хаба">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <h2 className="truncate text-base font-extrabold text-ink">Задачи</h2>
            <button
              type="button"
              aria-label="Добавить задачу"
              onClick={() => setOpenTask(true)}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-btn bg-blue-btn text-white"
            >
              <Plus size={18} aria-hidden="true" />
            </button>
          </div>
          <div className="mt-1 divide-y divide-line">
            {hubTasks.length === 0 ? (
              <p className="py-4 text-sm text-ink-2">Задач пока нет.</p>
            ) : (
              hubTasks.map((t) => (
                <TaskRow key={t.id} task={t} onToggle={() => completeTask.mutate(t)} />
              ))
            )}
          </div>
        </section>
      ) : null}

      {segment === "board" ? (
        <section aria-label="Доска задач">
          <div className="snap-x-cols no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
            {COLUMNS.map((col) => {
              const items = hubTasks.filter((t) => t.board_column === col.key);
              const idx = COLUMNS.findIndex((c) => c.key === col.key);
              return (
                <div key={col.key} className="snap-col w-[80%] shrink-0">
                  <div className="card h-full p-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-[15px] font-extrabold text-ink">{col.label}</h2>
                      <span className="num text-[12px] text-ink-3">{items.length}</span>
                    </div>
                    <ul className="mt-3 space-y-2">
                      {items.length === 0 ? (
                        <li className="text-[13px] text-ink-3">Пусто</li>
                      ) : null}
                      {items.map((t) => (
                        <li
                          key={t.id}
                          className="rounded-tile border border-line bg-bg p-3"
                        >
                          <p className="text-[14px] font-medium text-ink">{t.title}</p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="label-xs text-ink-3">{t.priority.toUpperCase()}</span>
                            <span className="flex gap-1">
                              <button
                                type="button"
                                aria-label={`Перенести задачу ${t.title} влево`}
                                disabled={idx === 0}
                                onClick={() =>
                                  moveTask.mutate({
                                    task: t,
                                    column: COLUMNS[idx - 1]!.key as BoardColumn,
                                  })
                                }
                                className="grid h-11 w-11 place-items-center rounded-btn border border-line-2 disabled:opacity-40"
                                style={{ color: "var(--blue-ink)" }}
                              >
                                <ChevronLeft size={16} aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                aria-label={`Перенести задачу ${t.title} вправо`}
                                disabled={idx === COLUMNS.length - 1}
                                onClick={() =>
                                  moveTask.mutate({
                                    task: t,
                                    column: COLUMNS[idx + 1]!.key as BoardColumn,
                                  })
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
          <section className="card p-4" aria-label="Документы хаба">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <h2 className="truncate text-base font-extrabold text-ink">Документы</h2>
              <button
                type="button"
                aria-label="Создать документ"
                onClick={async () => {
                  const created = await createDoc.mutateAsync(hub.id);
                  setOpenDocId(created.id);
                }}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-btn bg-blue-btn text-white"
              >
                <Plus size={18} aria-hidden="true" />
              </button>
            </div>
            <ul className="mt-2 divide-y divide-line">
              {hubDocs.length === 0 ? (
                <li className="py-4 text-sm text-ink-2">Документов нет.</li>
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
                      <span className="block truncate text-[15px] font-medium text-ink">
                        {d.title}
                      </span>
                      <span className="num block text-[11px] text-ink-3">
                        {d.blocks?.length ?? 0} блоков
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label={`Удалить документ ${d.title}`}
                    onClick={() => removeDoc.mutate(d.id)}
                    className="min-h-11 px-2 text-[13px] font-bold"
                    style={{ color: "var(--coral-tx)" }}
                  >
                    Удалить
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )
      ) : null}

      <Sheet open={openTask} onClose={() => setOpenTask(false)} title="Новая задача">
        <div className="space-y-3">
          <label className="block">
            <span className="label-xs text-ink-3">Заголовок</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 min-h-11 w-full rounded-btn border border-line-2 bg-bg px-3 text-ink"
              placeholder="Что нужно сделать"
            />
          </label>
          <fieldset>
            <legend className="label-xs text-ink-3">Приоритет</legend>
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
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[15px] font-bold text-ink">На сегодня</span>
            <button
              type="button"
              role="switch"
              aria-checked={isToday}
              aria-label="На сегодня"
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
            <p className="text-[13px]" style={{ color: "var(--coral-tx)" }}>
              {error}
            </p>
          ) : null}
          <button
            type="button"
            onClick={async () => {
              if (!title.trim()) {
                setError("Заголовок пустой. Введите название задачи.");
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
                setError(`Задача не создана: ${(e as Error).message}. Повторите попытку.`);
              }
            }}
            className="min-h-11 w-full rounded-btn bg-blue-btn text-sm font-bold text-white"
          >
            Добавить задачу
          </button>
        </div>
      </Sheet>
    </div>
  );
}
