import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { Field, TextareaField } from "@/components/Field";
import { Sheet } from "@/components/Sheet";
import {
  PRIORITY_LABEL,
  announce,
  offerUndo,
  hubColor,
  useHubs,
  useDailyPlan,
  useDailyPlanMutations,
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
  const { patchTask, removeTask, restoreTask } = useTaskMutations();
  const planQ = useDailyPlan();
  const planMutations = useDailyPlanMutations();
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setTitle(task?.title ?? "");
    setNotes(task?.notes ?? "");
  }, [task]);

  if (!task) return null;

  const patch = (p: Partial<Task>) => patchTask.mutate({ id: task.id, patch: p });

  return (
    <Sheet open onClose={onClose} title="Task">
      <div className="space-y-4">
        <Field
          id="task-title"
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => {
            const next = title.trim();
            if (next && next !== task.title) patch({ title: next });
          }}
        />

        <TextareaField
          id="task-notes"
          label="Notes"
          value={notes}
          rows={4}
          placeholder="Context, links, or the next small step"
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => {
            if (notes !== task.notes) patch({ notes });
          }}
        />

        <fieldset>
          <legend className="label-xs text-ink-3">Hub</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {hubs.map((h) => (
              <button
                key={h.id}
                type="button"
                aria-pressed={task.hub_id === h.id}
                onClick={() => patch({ hub_id: h.id })}
                className="inline-flex min-h-11 items-center gap-2 rounded-chip border px-3 t-aux font-bold"
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
          <legend className="label-xs text-ink-3">Focus duration</legend>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {([15, 25, 45, 60] as const).map((minutes) => (
              <Button key={minutes} variant={task.duration_minutes === minutes ? "primary" : "secondary"} onClick={() => patch({ duration_minutes: minutes })}>
                {minutes} min
              </Button>
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
                className="min-h-11 rounded-btn border t-aux font-bold"
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

        <div className="surface-sunk p-3">
          <p className="t-body font-bold text-ink">Today’s plan</p>
          <p className="mt-1 t-aux text-ink-2">
            {planQ.data?.slots.some((slot) => slot.task_id === task.id)
              ? "This task has one of today’s three priority slots."
              : "Choose its exact slot on the Today screen so another priority is never replaced silently."}
          </p>
          {planQ.data?.slots.some((slot) => slot.task_id === task.id) ? (
            <Button
              variant="secondary"
              block
              className="mt-3"
              loading={planMutations.removeTask.isPending}
              onClick={() => planMutations.removeTask.mutate({ taskId: task.id, expectedRevision: planQ.data?.revision ?? 0 })}
            >
              Remove from today
            </Button>
          ) : null}
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
                className="num min-h-11 rounded-btn border t-body font-bold"
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

        <Button
          variant="danger"
          size="md"
          block
          onClick={() => {
            const snapshot = task;
            removeTask.mutate(snapshot.id);
            offerUndo({
              message: `${snapshot.title} deleted`,
              onUndo: () => restoreTask.mutate(snapshot),
            });
            onClose();
          }}
        >
          Delete task
        </Button>
      </div>
    </Sheet>
  );
}
