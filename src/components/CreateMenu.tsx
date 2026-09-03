import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Sheet } from "@/components/Sheet";
import {
  HUB_COLORS,
  announce,
  useDocMutations,
  useHubMutations,
  useHubs,
  useTaskMutations,
  type Priority,
} from "@/lib/app";

type Mode = "menu" | "task" | "hub" | "doc";

/** Floating create button: New task, New hub, New doc from any working tab. */
export function CreateMenu() {
  const [mode, setMode] = useState<Mode | null>(null);
  const { data: hubs = [] } = useHubs();
  const { createTask } = useTaskMutations();
  const { createHub } = useHubMutations();
  const { createDoc } = useDocMutations();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [hubId, setHubId] = useState<string | null>(null);
  const [priority, setPriority] = useState<Priority>("p2");
  const [today, setToday] = useState(false);
  const [hubName, setHubName] = useState("");
  const [color, setColor] = useState("blue");
  const [error, setError] = useState("");

  const close = () => {
    setMode(null);
    setError("");
  };

  const chosenHub = hubId ?? hubs[0]?.id ?? null;

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center">
        <div
          className="pointer-events-none relative mx-3 w-full max-w-[406px]"
          style={{ marginBottom: "calc(84px + env(safe-area-inset-bottom))" }}
        >
          <button
            type="button"
            aria-label="Create something new"
            onClick={() => setMode("menu")}
            className="pointer-events-auto absolute bottom-0 right-0 grid h-14 w-14 place-items-center rounded-btn ring-on-solid bg-blue-btn text-white"
            style={{ boxShadow: "var(--shadow-float)" }}
          >
            <Plus size={24} aria-hidden="true" />
          </button>
        </div>
      </div>

      <Sheet open={mode === "menu"} onClose={close} title="Create">
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setMode("task")}
            className="min-h-12 w-full rounded-btn border border-line-2 text-sm font-bold text-ink"
          >
            New task
          </button>
          <button
            type="button"
            onClick={() => setMode("hub")}
            className="min-h-12 w-full rounded-btn border border-line-2 text-sm font-bold text-ink"
          >
            New hub
          </button>
          <button
            type="button"
            onClick={() => setMode("doc")}
            className="min-h-12 w-full rounded-btn border border-line-2 text-sm font-bold text-ink"
          >
            New doc
          </button>
        </div>
      </Sheet>

      <Sheet open={mode === "task"} onClose={close} title="New task">
        <div className="space-y-3">
          <label className="block">
            <span className="label-xs text-ink-3">Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What has to be done"
              className="mt-1 min-h-11 w-full rounded-btn border border-line-2 bg-bg px-3 text-ink"
            />
          </label>

          {hubs.length > 0 ? (
            <fieldset>
              <legend className="label-xs text-ink-3">Hub</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {hubs.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    aria-pressed={chosenHub === h.id}
                    onClick={() => setHubId(h.id)}
                    className="min-h-11 rounded-chip border px-3 t-aux font-bold text-ink"
                    style={{
                      borderColor: chosenHub === h.id ? "var(--ink)" : "var(--line-2)",
                    }}
                  >
                    {h.name}
                  </button>
                ))}
              </div>
            </fieldset>
          ) : null}

          <fieldset>
            <legend className="label-xs text-ink-3">Priority</legend>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(["p1", "p2", "p3"] as Priority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  aria-pressed={priority === p}
                  onClick={() => setPriority(p)}
                  className="min-h-11 rounded-btn border t-aux font-bold text-ink"
                  style={{ borderColor: priority === p ? "var(--ink)" : "var(--line-2)" }}
                >
                  {p === "p1" ? "Important" : p === "p2" ? "Normal" : "Later"}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="flex items-center justify-between gap-3">
            <span className="t-body text-ink">Add to today</span>
            <input
              type="checkbox"
              checked={today}
              onChange={(e) => setToday(e.target.checked)}
              className="h-6 w-6"
            />
          </label>

          {error ? (
            <p className="t-aux" style={{ color: "var(--coral-tx)" }}>
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={async () => {
              if (!title.trim()) {
                setError("The title is empty. Write what has to be done.");
                return;
              }
              try {
                await createTask.mutateAsync({
                  title: title.trim(),
                  hub_id: chosenHub,
                  priority,
                  is_today: today,
                });
                announce("Task created");
                setTitle("");
                setToday(false);
                close();
              } catch (e) {
                setError(`Couldn't create the task — ${(e as Error).message}. Try again.`);
              }
            }}
            className="min-h-12 w-full rounded-btn ring-on-solid bg-blue-btn text-sm font-bold text-white"
          >
            Create task
          </button>
        </div>
      </Sheet>

      <Sheet open={mode === "hub"} onClose={close} title="New hub">
        <div className="space-y-3">
          <label className="block">
            <span className="label-xs text-ink-3">Name</span>
            <input
              value={hubName}
              onChange={(e) => setHubName(e.target.value)}
              placeholder="For example, Marketing"
              className="mt-1 min-h-11 w-full rounded-btn border border-line-2 bg-bg px-3 text-ink"
            />
          </label>
          <fieldset>
            <legend className="label-xs text-ink-3">Color</legend>
            <div className="mt-2 flex gap-2">
              {HUB_COLORS.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  aria-label={c.label}
                  aria-pressed={color === c.key}
                  onClick={() => setColor(c.key)}
                  className="h-11 w-11 rounded-btn border-2"
                  style={{
                    background: c.value,
                    borderColor: color === c.key ? "var(--ink)" : "transparent",
                  }}
                />
              ))}
            </div>
          </fieldset>
          {error ? (
            <p className="t-aux" style={{ color: "var(--coral-tx)" }}>
              {error}
            </p>
          ) : null}
          <button
            type="button"
            onClick={async () => {
              if (!hubName.trim()) {
                setError("The name is empty. Enter a hub name.");
                return;
              }
              try {
                await createHub.mutateAsync({
                  name: hubName.trim(),
                  description: "",
                  color,
                });
                announce("Hub created");
                setHubName("");
                close();
              } catch (e) {
                setError(`Couldn't create the hub — ${(e as Error).message}. Try again.`);
              }
            }}
            className="min-h-12 w-full rounded-btn ring-on-solid bg-blue-btn text-sm font-bold text-white"
          >
            Create hub
          </button>
        </div>
      </Sheet>

      <Sheet open={mode === "doc"} onClose={close} title="New doc">
        {hubs.length === 0 ? (
          <div className="space-y-3">
            <p className="t-body font-normal text-ink-2">
              A doc lives in a hub, and there is no hub yet. Create a hub first.
            </p>
            <button
              type="button"
              onClick={() => setMode("hub")}
              className="min-h-12 w-full rounded-btn ring-on-solid bg-blue-btn text-sm font-bold text-white"
            >
              New hub
            </button>
          </div>
        ) : (
          <ul className="space-y-2">
            {hubs.map((h) => (
              <li key={h.id}>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await createDoc.mutateAsync({ hub_id: h.id });
                      await qc.invalidateQueries({ queryKey: ["docs"] });
                      announce("Doc created");
                      close();
                      navigate({ to: "/hubs/$hubId", params: { hubId: h.id } });
                    } catch (e) {
                      setError(`Couldn't create the doc — ${(e as Error).message}. Try again.`);
                    }
                  }}
                  className="min-h-12 w-full rounded-btn border border-line-2 px-3 text-left t-body text-ink"
                >
                  In {h.name}
                </button>
              </li>
            ))}
            {error ? (
              <li className="t-aux" style={{ color: "var(--coral-tx)" }}>
                {error}
              </li>
            ) : null}
          </ul>
        )}
      </Sheet>
    </>
  );
}
