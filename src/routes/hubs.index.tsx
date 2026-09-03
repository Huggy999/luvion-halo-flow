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
      { title: "Хабы — Luvion" },
      {
        name: "description",
        content:
          "Хабы Luvion объединяют задачи, доску и документы одного направления: продукт, компания, личное.",
      },
      { property: "og:title", content: "Хабы — Luvion" },
      {
        property: "og:description",
        content: "Задачи, доска и документы, сгруппированные по направлениям.",
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
          <p className="label-xs text-ink-3">Направления</p>
          <h1 className="screen-title mt-1 text-[30px] leading-tight text-ink">Хабы</h1>
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
            {hubs.length} из {limit} на тарифе {TIER_LABEL[billing.tier]}
          </button>
        ) : (
          <button
            type="button"
            aria-label="Создать хаб"
            onClick={() => setOpen(true)}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-btn bg-blue-btn text-white"
          >
            <Plus size={20} aria-hidden="true" />
          </button>
        )}
      </header>

      {nearLimit ? (
        <p className="px-1 text-[13px] text-ink-2">
          Остался один хаб из {limit} на тарифе {TIER_LABEL[billing.tier]}. Задачи, документы
          и доска существующих хабов не меняются.
        </p>
      ) : null}

      {boundaryVisible ? (
        <BoundaryCard
          id="hubs-limit"
          left={`Хабов ${hubs.length} из ${limit} на тарифе ${TIER_LABEL[billing.tier]}. Новый пока не создать.`}
          stops="создание новых хабов сверх лимита"
          continues="все существующие хабы, задачи, документы, серия и фокус-таймер"
          onDismiss={() => setDismissed(true)}
        />
      ) : null}

      <div className="space-y-3">
        {hubs.length === 0 ? (
          <p className="card p-4 text-sm text-ink-2">
            Хабов нет. Создайте первый, чтобы собрать задачи и документы вместе.
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
                    {hub.description || "Без описания"}
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

      <Sheet open={open} onClose={() => setOpen(false)} title="Новый хаб">
        <div className="space-y-3">
          <label className="block">
            <span className="label-xs text-ink-3">Название</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 min-h-11 w-full rounded-btn border border-line-2 bg-bg px-3 text-ink"
              placeholder="Например, Маркетинг"
            />
          </label>
          <label className="block">
            <span className="label-xs text-ink-3">Описание</span>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 min-h-11 w-full rounded-btn border border-line-2 bg-bg px-3 text-ink"
              placeholder="Короткое пояснение"
            />
          </label>
          <fieldset>
            <legend className="label-xs text-ink-3">Цвет</legend>
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
                setError("Название пустое. Введите название хаба.");
                return;
              }
              try {
                if (billing.signedIn) {
                  // Лимит проверяется на сервере, клиентская проверка — только удобство.
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
                setError(`Хаб не создан: ${(e as Error).message}. Повторите попытку.`);
              }
            }}
            className="min-h-11 w-full rounded-btn bg-blue-btn text-sm font-bold text-white"
          >
            Создать хаб
          </button>
        </div>
      </Sheet>
    </div>
  );
}
