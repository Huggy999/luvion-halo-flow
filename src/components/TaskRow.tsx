import { useState } from "react";
import type { Hub, Task } from "@/lib/app";
import { hubColor, PRIORITY_LABEL } from "@/lib/app";

export function TaskCheck({
  checked,
  onToggle,
  label,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
}) {
  const [justChecked, setJustChecked] = useState(false);
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={() => {
        if (!checked) setJustChecked(true);
        onToggle();
      }}
      className="tap-44 grid h-7 w-7 shrink-0 place-items-center rounded-[9px] border-2 transition-colors"
      style={{
        borderColor: checked ? "var(--mint)" : "var(--line-2)",
        background: checked ? "var(--mint)" : "transparent",
      }}
    >
      {checked ? (
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M5 12.5l4.5 4.5L19 7"
            fill="none"
            stroke="#fff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={justChecked ? "check-draw" : ""}
          />
        </svg>
      ) : null}
    </button>
  );
}

export function TaskRow({
  task,
  hub,
  onToggle,
  onOpen,
  right,
}: {
  task: Task;
  hub?: Hub | undefined;
  onToggle: () => void;
  onOpen?: (() => void) | undefined;
  right?: React.ReactNode | undefined;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <TaskCheck
        checked={task.is_done}
        onToggle={onToggle}
        label={`Mark ${task.title} done`}
      />
      <div className="min-w-0 flex-1">
        <div className="relative inline-block max-w-full">
          {onOpen ? (
            <button
              type="button"
              onClick={onOpen}
              aria-label={`Open ${task.title}`}
              className={`block max-w-full truncate py-1 text-left text-[15px] font-medium ${
                task.is_done ? "strike text-ink-3" : "text-ink"
              }`}
            >
              {task.title}
            </button>
          ) : (
            <span
              className={`block truncate text-[15px] font-medium ${
                task.is_done ? "strike text-ink-3" : "text-ink"
              }`}
            >
              {task.title}
            </span>
          )}
        </div>

        <div className="mt-0.5 flex items-center gap-2">
          {hub ? (
            <span className="flex items-center gap-1.5 text-[11px] text-ink-2">
              <span
                className="h-2 w-2 rounded-chip"
                style={{ background: hubColor(hub.color) }}
                aria-hidden="true"
              />
              {hub.name}
            </span>
          ) : null}
          <span
            className="label-xs"
            style={{
              color:
                task.priority === "p1"
                  ? "var(--coral-tx)"
                  : task.priority === "p2"
                    ? "var(--blue-ink)"
                    : "var(--ink-3)",
            }}
          >
            {PRIORITY_LABEL[task.priority]}
          </span>
        </div>
      </div>
      {right}
    </div>
  );
}
