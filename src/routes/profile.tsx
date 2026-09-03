import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Lumi } from "@/components/Lumi";
import { Sheet } from "@/components/Sheet";
import {
  announce,
  haloLevel,
  resetAllData,
  useAppState,
  useTasks,
  useUpdateState,
} from "@/lib/app";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Профиль — Luvion" },
      {
        name: "description",
        content:
          "Уровень нимба, рекорд серии, выбор светлой или чёрно-золотой темы и сброс данных Luvion.",
      },
      { property: "og:title", content: "Профиль — Luvion" },
      {
        property: "og:description",
        content: "Настройки Luvion: тема, Луми, серии и сброс данных.",
      },
    ],
  }),
  component: ProfileScreen,
});

function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-[15px] font-bold text-ink">{label}</p>
        <p className="text-[13px] text-ink-2">{hint}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className="relative h-11 w-16 shrink-0 rounded-chip border border-line-2 px-1"
        style={{ background: checked ? "var(--blue-btn)" : "var(--bg)" }}
      >
        <span
          className="block h-7 w-7 rounded-chip bg-paper transition-transform"
          style={{ transform: checked ? "translateX(28px)" : "translateX(0)" }}
        />
      </button>
    </div>
  );
}

function ProfileScreen() {
  const { data: state } = useAppState();
  const { data: tasks = [] } = useTasks();
  const update = useUpdateState();
  const qc = useQueryClient();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const streak = state?.streak ?? 0;
  const level = haloLevel(Math.max(streak, 1));
  const closed = tasks.filter((t) => t.is_done).length;

  return (
    <div className="cascade space-y-4">
      <header>
        <p className="label-xs text-ink-3">Личное пространство</p>
        <h1 className="screen-title mt-1 text-[30px] leading-tight text-ink">Профиль</h1>
      </header>

      <section className="card p-5" aria-label="Уровень нимба">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
          <Lumi variant="glow" size={68} className="shrink-0" breathe />
          <div className="min-w-0">
            <p className="label-xs" style={{ color: "var(--halo-tx)" }}>
              Уровень {level.name}
            </p>
            <p className="num mt-1 text-2xl font-bold text-ink">{streak} дней подряд</p>
            <p className="mt-1 text-[13px] text-ink-2">
              Рекорд {state?.best_streak ?? 0} · закрыто задач {closed}
            </p>
          </div>
        </div>
      </section>

      <section className="card p-4" aria-label="Тема">
        <h2 className="text-base font-extrabold text-ink">Тема</h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[
            { key: "light", label: "Светлая" },
            { key: "dark", label: "Чёрно-золотая" },
          ].map((t) => {
            const active = (state?.theme ?? "light") === t.key;
            return (
              <button
                key={t.key}
                type="button"
                aria-pressed={active}
                onClick={() => update.mutate({ theme: t.key as "light" | "dark" })}
                className="min-h-11 rounded-btn border px-3 py-2.5 text-sm font-bold"
                style={{
                  borderColor: active ? "var(--blue)" : "var(--line-2)",
                  color: active ? "var(--blue-ink)" : "var(--ink-2)",
                  background: active
                    ? "color-mix(in oklab, var(--blue) 10%, transparent)"
                    : "transparent",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="card px-4 py-1" aria-label="Настройки">
        <Toggle
          checked={state?.lumi_enabled ?? true}
          onChange={(v) => update.mutate({ lumi_enabled: v })}
          label="Луми"
          hint="Помощник и подсказки в интерфейсе"
        />
        <div className="h-px bg-line" />
        <Toggle
          checked={state?.streaks_enabled ?? true}
          onChange={(v) => update.mutate({ streaks_enabled: v })}
          label="Серии"
          hint="Счётчик дней подряд и празднование"
        />
      </section>

      <section className="card p-4" aria-label="Данные">
        <h2 className="text-base font-extrabold text-ink">Данные</h2>
        <p className="mt-1 text-[13px] text-ink-2">
          Сброс удалит хабы, задачи, документы, историю чата и обнулит серию.
        </p>
        {error ? (
          <p className="mt-2 text-[13px]" style={{ color: "var(--coral-tx)" }}>
            {error}
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => setConfirm(true)}
          className="mt-3 min-h-11 w-full rounded-btn border px-4 text-sm font-bold"
          style={{ borderColor: "var(--coral)", color: "var(--coral-tx)" }}
        >
          Сбросить данные
        </button>
      </section>

      <Sheet open={confirm} onClose={() => setConfirm(false)} title="Сбросить все данные">
        <p className="text-sm text-ink-2">
          Действие необратимо. Хабы, задачи, документы и история чата будут удалены.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setConfirm(false)}
            className="min-h-11 rounded-btn border border-line-2 text-sm font-bold text-ink-2"
          >
            Отмена
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setError("");
              try {
                await resetAllData();
                await qc.invalidateQueries();
                announce("Данные сброшены");
                setConfirm(false);
              } catch (e) {
                setError(
                  `Сброс не выполнен: ${(e as Error).message}. Проверьте соединение и повторите.`,
                );
              } finally {
                setBusy(false);
              }
            }}
            className="min-h-11 rounded-btn text-sm font-bold text-white"
            style={{ background: "var(--coral)" }}
          >
            {busy ? "Удаление" : "Сбросить"}
          </button>
        </div>
      </Sheet>
    </div>
  );
}
