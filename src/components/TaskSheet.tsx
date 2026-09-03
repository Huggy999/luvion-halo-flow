import { useEffect, useState } from "react";
import { Sheet } from "@/components/Sheet";
import {
  PRIORITY_LABEL,
  announce,
  hubColor,
  useHubs,
  useTaskMutations,
  type Priority,
  type Task,
} from "@/lib/app";

/**
 * The task card: title, hub, priority, add to today, an estimate in focus
 * sessions and delete. Deliberately nothing else — no dates, notes or subtasks.
 */
export function TaskSheet({ task, onClose }: { task: Task | null; onClose: () => void }) {
  const { data: hubs = [] } = useHubs();
  const { patchTask, removeTask } = useTaskMutations();
  const [title, setTitle] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setTitle(task?.title ?? "");
    setConfirmDelete(false);
  }, [task]);

  if (!task) return null;

  const patch = (p: Partial<Task>) => patchTask.mutate({ id: task.id, patch: p });

  return (
    <Sheet open onClose={onClose} title="Task">
      <div className="space-y-4">
        <label className="block">
          <span className="label-xs text-ink-3">Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => {
              const next = title.trim();
              if (next && next !== task.title) patch({ title: next });
            }}
            className="mt-1 min-h-11 w-full rounded-btn border border-line-2 bg-bg px-3 text-ink"
          />
        </label>

        <fieldset>
          <legend className="label-xs text-ink-3">Hub</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {hubs.map((h) => (
              <button
                key={h.id}
                type="button"
                aria-pressed={task.hub_id === h.id}
                onClick={() => patch({ hub_id: h.id })}
                className="inline-flex min-h-11 items-center gap-2 rounded-chip border px-3 text-[13px] font-bold"
                style={{
                  borderColor: task.hub_id === h.id ? "var(--ink)" : "var(--line-2)",
                  color: "var(--ink)",
                }}
              >
                <span
                  className="h-2 w-2 rounded-chip"
                  style={{ background: hubColor(h.color) }}
                  aria-hidden="true"
                />
                {h.name}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="label-xs text-ink-3">Priority</legend>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {(["p1", "p2", "p3"] as Priority[]).map((p) => (
              <button
                key={p}
                type="button"
                aria-pressed={task.priority === p}
                onClick={() => patch({ priority: p })}
                className="min-h-11 rounded-btn border text-[13px] font-bold"
                style={{
                  borderColor: task.priority === p ? "var(--ink)" : "var(--line-2)",
                  color: "var(--ink)",
                }}
              >
                {PRIORITY_LABEL[p]}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="flex items-center justify-between gap-3">
          <span className="text-[15px] text-ink">Add to today</span>
          <button
            type="button"
            role="switch"
            aria-checked={task.is_today}
            aria-label="Add to today"
            onClick={() => {
              patch({ is_today: !task.is_today });
              announce(task.is_today ? "Removed from today" : "Added to today");
            }}
            className="relative h-7 w-12 shrink-0 rounded-chip border transition-colors"
            style={{
              background: task.is_today ? "var(--mint)" : "var(--line-2)",
              borderColor: task.is_today ? "var(--mint)" : "var(--line-2)",
            }}
          >
            <span
              className="absolute top-0.5 h-5 w-5 rounded-chip bg-paper transition-all"
              style={{ left: task.is_today ? "26px" : "4px" }}
              aria-hidden="true"
            />
          </button>
        </div>

        <fieldset>
          <legend className="label-xs text-ink-3">Estimate in focus sessions</legend>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={task.focus_sessions === n}
                onClick={() => patch({ focus_sessions: n })}
                className="num min-h-11 rounded-btn border text-[15px] font-bold"
                style={{
                  borderColor: task.focus_sessions === n ? "var(--ink)" : "var(--line-2)",
                  color: "var(--ink)",
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </fieldset>

        {confirmDelete ? (
          <div className="space-y-2">
            <p className="text-[14px] text-ink-2">
              Delete {task.title}. The task is gone from every screen and cannot be restored.
            </p>
            <button
              type="button"
              onClick={() => {
                removeTask.mutate(task.id);
                announce("Task deleted");
                onClose();
              }}
              className="min-h-11 w-full rounded-btn border text-sm font-bold"
              style={{ borderColor: "var(--coral)", color: "var(--coral-tx)" }}
            >
              Delete the task
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="min-h-11 w-full rounded-btn border border-line-2 text-sm font-bold text-ink"
            >
              Keep the task
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="min-h-11 w-full rounded-btn border border-line-2 text-sm font-bold"
            style={{ color: "var(--coral-tx)" }}
          >
            Delete task
          </button>
        )}
      </div>
    </Sheet>
  );
}
