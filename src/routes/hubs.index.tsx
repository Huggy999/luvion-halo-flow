import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Sheet } from "@/components/Sheet";
import { BoundaryCard } from "@/components/BoundaryCard";
import { HUB_COLORS, hubColor, useHubMutations, useHubs, useTasks } from "@/lib/app";
import { LIMITS, TIER_LABEL, isBoundaryHidden, useBilling } from "@/lib/billing";
import { createHubGuarded } from "@/lib/billing.functions";

export const Route = createFileRoute("/hubs/")({
  head: () => ({
    meta: [
      { title: "Hubs — Luvion" },
      {
        name: "description",
        content:
          "Luvion hubs keep the tasks, the board and the docs of one area together: Product, Company, Personal.",
      },
      { property: "og:title", content: "Hubs — Luvion" },
      {
        property: "og:description",
        content: "Tasks, the board and docs grouped by area.",
      },
    ],
  }),
  component: HubsScreen,
});

function HubsScreen() {
  const { data: hubs = [] } = useHubs();
  const { data: tasks = [] } = useTasks();
  const { createHub } = useHubMutations();
  const { billing } = useBilling();
  const guarded = useServerFn(createHubGuarded);
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("blue");
  const [error, setError] = useState("");
  const [showBoundary, setShowBoundary] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const limit = LIMITS[billing.tier].hubs;
  const atLimit = limit !== null && hubs.length >= limit;
  const nearLimit = limit !== null && hubs.length === limit - 1;
  const boundaryVisible =
    showBoundary && !dismissed && !isBoundaryHidden("hubs-limit");

  return (
    <div className="cascade space-y-4">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <p className="label-xs text-ink-3">Areas · {tasks.length} tasks in all</p>
          <h1 className="screen-title mt-1 text-[30px] leading-tight text-ink">Hubs</h1>
        </div>

        {atLimit ? (
          <button
            type="button"
            onClick={() => {
              setDismissed(false);
              setShowBoundary(true);
            }}
            className="min-h-11 shrink-0 rounded-btn border border-line-2 px-3 text-[13px] font-bold"
            style={{ color: "var(--ink-2)" }}
          >
            {hubs.length} of {limit} on {TIER_LABEL[billing.tier]}
          </button>
        ) : (
          <button
            type="button"
            aria-label="Create hub"
            onClick={() => setOpen(true)}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-btn bg-blue-btn text-white"
          >
            <Plus size={20} aria-hidden="true" />
          </button>
        )}
      </header>

      {nearLimit ? (
        <p className="px-1 text-[13px] text-ink-2">
          One hub left of {limit} on {TIER_LABEL[billing.tier]}. Tasks, docs and the board of
          existing hubs stay exactly as they are.
        </p>
      ) : null}

      {boundaryVisible ? (
        <BoundaryCard
          id="hubs-limit"
          left={`${hubs.length} of ${limit} hubs on ${TIER_LABEL[billing.tier]}. A new one cannot be created yet.`}
          stops="creating new hubs beyond the limit"
          continues="every existing hub, task and doc, the halo, the streak and the focus timer"
          onDismiss={() => setDismissed(true)}
        />
      ) : null}

      <div className="space-y-3">
        {hubs.length === 0 ? (
          <p className="card p-4 text-sm text-ink-2">
            No hubs yet. Create the first one to keep tasks and docs together.
          </p>
        ) : null}
        {hubs.map((hub) => {
          const list = tasks.filter((t) => t.hub_id === hub.id);
          const done = list.filter((t) => t.is_done).length;
          const ratio = list.length ? done / list.length : 0;
          return (
            <Link
              key={hub.id}
              to="/hubs/$hubId"
              params={{ hubId: hub.id }}
              className="card block p-4"
            >
              <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                <span
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-tile text-lg font-extrabold text-white"
                  style={{ background: hubColor(hub.color) }}
                  aria-hidden="true"
                >
                  {hub.name.slice(0, 1)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[16px] font-extrabold text-ink">
                    {hub.name}
                  </span>
                  <span className="block truncate text-[13px] text-ink-2">
                    {hub.description || "No description"}
                  </span>
                </span>
                <span className="num shrink-0 text-[13px] text-ink-3">
                  {done}/{list.length}
                </span>
              </div>
              <span className="mt-3 block h-1.5 w-full rounded-chip bg-line">
                <span
                  className="block h-full rounded-chip"
                  style={{ width: `${ratio * 100}%`, background: hubColor(hub.color) }}
                />
              </span>
            </Link>
          );
        })}
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title="New hub">
        <div className="space-y-3">
          <label className="block">
            <span className="label-xs text-ink-3">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 min-h-11 w-full rounded-btn border border-line-2 bg-bg px-3 text-ink"
              placeholder="For example, Marketing"
            />
          </label>
          <label className="block">
            <span className="label-xs text-ink-3">Description</span>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 min-h-11 w-full rounded-btn border border-line-2 bg-bg px-3 text-ink"
              placeholder="A short explanation"
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
            <p className="text-[13px]" style={{ color: "var(--coral-tx)" }}>
              {error}
            </p>
          ) : null}
          <button
            type="button"
            onClick={async () => {
              if (!name.trim()) {
                setError("The name is empty. Enter a hub name.");
                return;
              }
              try {
                if (billing.signedIn) {
                  // The limit is enforced on the server; the client check is only convenience.
                  const res = await guarded({
                    data: { name: name.trim(), description, color },
                  });
                  if (!res.ok) {
                    setError(res.reason);
                    return;
                  }
                  await qc.invalidateQueries({ queryKey: ["hubs"] });
                } else {
                  await createHub.mutateAsync({ name: name.trim(), description, color });
                }
                setName("");
                setDescription("");
                setColor("blue");
                setError("");
                setOpen(false);
              } catch (e) {
                setError(`Couldn't create the hub — ${(e as Error).message}. Try again.`);
              }
            }}
            className="min-h-11 w-full rounded-btn bg-blue-btn text-sm font-bold text-white"
          >
            Create hub
          </button>
        </div>
      </Sheet>
    </div>
  );
}
