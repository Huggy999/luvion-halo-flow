import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { Field, TextareaField } from "@/components/Field";
import { Sheet } from "@/components/Sheet";
import { Switch } from "@/components/Switch";
import {
  PRIORITY_LABEL,
  announce,
  offerUndo,
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
  const { patchTask, removeTask, restoreTask } = useTaskMutations();
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

        <div className="flex items-center justify-between gap-3">
          <span className="t-body text-ink">Add to today</span>
          <Switch
            aria-label="Add to today"
            checked={task.is_today}
            onCheckedChange={(next) => {
              patch({ is_today: next });
              announce(next ? "Added to today" : "Removed from today");
            }}
          />
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
