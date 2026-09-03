import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lumi } from "@/components/Lumi";
import { HaloSheet } from "@/components/HaloSheet";
import {
  haloLevel,
  hubColor,
  STREAK_EVENT,
  streakLabel,
  todayISO,
  useAppState,
  useHubs,
  useTasks,
} from "@/lib/app";
import { BoundaryCard } from "@/components/BoundaryCard";
import { isBoundaryHidden, useBilling } from "@/lib/billing";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pulse — Luvion" },
      {
        name: "description",
        content:
          "The daily pulse in Luvion: the halo streak and the three tasks in focus today.",
      },
      { property: "og:title", content: "Pulse — Luvion" },
      {
        property: "og:description",
        content: "The halo streak and today's focus on one screen.",
      },
    ],
  }),
  component: PulseScreen,
});

function Celebration({ streak }: { streak: number }) {
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);

  useEffect(() => {
    const onUp = () => {
      setPhase(1);
      const t1 = window.setTimeout(() => setPhase(2), 280);
      const t2 = window.setTimeout(() => setPhase(3), 560);
      const t3 = window.setTimeout(() => setPhase(0), 900);
      return () => [t1, t2, t3].forEach(clearTimeout);
    };
    window.addEventListener(STREAK_EVENT, onUp);
    return () => window.removeEventListener(STREAK_EVENT, onUp);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden="true">
      {phase === 2
        ? Array.from({ length: 7 }).map((_, i) => (
            <span
              key={i}
              className="ray absolute h-8 w-[3px] rounded-chip"
              style={
                {
                  background: "var(--halo)",
                  "--a": `${(360 / 7) * i}deg`,
                } as React.CSSProperties
              }
            />
          ))
        : null}
      {phase === 3
        ? Array.from({ length: 10 }).map((_, i) => (
            <span
              key={i}
              className="spark absolute h-1.5 w-1.5 rounded-chip"
              style={
                {
                  background: "var(--halo)",
                  "--dx": `${Math.cos((i / 10) * Math.PI * 2) * 60}px`,
                  "--dy": `${Math.sin((i / 10) * Math.PI * 2) * 60}px`,
                } as React.CSSProperties
              }
            />
          ))
        : null}
      <span className="sr-only">{streak}</span>
    </div>
  );
}

function PulseScreen() {
  const { data: state } = useAppState();
  const { data: tasks = [] } = useTasks();
  const { data: hubs = [] } = useHubs();
  const { billing } = useBilling();
  const [softDismissed, setSoftDismissed] = useState(false);
  const [haloOpen, setHaloOpen] = useState(false);
  const softWarning =
    billing.signedIn &&
    billing.aiLimit > 0 &&
    billing.aiUsed / billing.aiLimit >= 0.8 &&
    !softDismissed &&
    !isBoundaryHidden("lumi-soft-pulse");
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const onUp = () => {
      setFlash(true);
      const t = window.setTimeout(() => setFlash(false), 900);
      return () => clearTimeout(t);
    };
    window.addEventListener(STREAK_EVENT, onUp);
    return () => window.removeEventListener(STREAK_EVENT, onUp);
  }, []);

  const today = todayISO();
  const streak = state?.streaks_enabled ? (state?.streak ?? 0) : 0;
  const level = haloLevel(Math.max(streak, 1));
  const nextName = level.next ? haloLevel(level.next).name : null;
  const progress = level.next
    ? Math.min(1, (streak - (level.min - 1)) / (level.next - (level.min - 1)))
    : 1;

  const countedToday = state?.last_streak_date === today;
  const focus = tasks.filter((t) => t.is_today);
  const focusDone = focus.filter((t) => t.is_done).length;

  const dateLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const ring = 2 * Math.PI * 46;

  return (
    <div className="cascade space-y-4">
      <header>
        <p className="label-xs text-ink-3">{dateLabel}</p>
        <h1 className="screen-title mt-1 text-[30px] leading-tight text-ink">Pulse</h1>
      </header>

      <section
        className="card relative overflow-hidden"
        style={{
          background:
            "linear-gradient(150deg, color-mix(in oklab, var(--halo) 22%, var(--paper)), var(--paper))",
        }}
        aria-label="Halo and streak"
      >
        <Celebration streak={streak} />
        <button
          type="button"
          onClick={() => setHaloOpen(true)}
          aria-label="Open the halo levels"
          className="block w-full p-5 text-left"
        >
          <div className="grid grid-cols-[112px_minmax(0,1fr)] items-center gap-4">
            <div>
              <div className="relative h-28 w-28">
                <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90">
                  <circle cx="50" cy="50" r="46" fill="none" stroke="var(--line-2)" strokeWidth="6" />
                  <circle
                    cx="50"
                    cy="50"
                    r="46"
                    fill="none"
                    stroke="var(--halo)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={ring}
                    strokeDashoffset={ring * (1 - progress)}
                    className="halo-breathe"
                  />
                </svg>
                <div className="absolute inset-0 grid place-items-center">
                  <Lumi
                    variant={streak > 0 ? "glow" : "sleep"}
                    size={62}
                    className={flash ? "halo-flash" : ""}
                  />
                </div>
              </div>
              <p className="label-xs mt-2 text-center text-ink-2">
                {nextName ? `${level.name} → ${nextName}` : `${level.name} · highest level`}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-bold" style={{ color: "var(--halo-tx)" }}>
                {streak > 0
                  ? `${level.name} · day ${streak} of your streak`
                  : `${level.name} · your streak has not started`}
              </p>
              <p className="num mt-1 overflow-hidden text-[42px] font-bold leading-none text-ink">
                <span className={flash ? "roll inline-block" : "inline-block"}>{streak}</span>
                <span className="ml-2 text-base font-medium text-ink-2">
                  {streak === 1 ? "day in a row" : "days in a row"}
                </span>
              </p>
              <p className="mt-1.5 text-[13px] text-ink-2">
                {!state?.streaks_enabled
                  ? "Streaks are turned off in Profile"
                  : streak === 0
                    ? "The halo starts with the first closed task"
                    : level.next
                      ? `${level.next - streak} more days to ${nextName}`
                      : "Highest halo level"}
              </p>
              <p className="mt-1.5 text-[13px] text-ink-3">Tap to see all five levels</p>
            </div>
          </div>
        </button>
      </section>

      <HaloSheet open={haloOpen} onClose={() => setHaloOpen(false)} streak={streak} />

      <section className="card p-4" aria-label="Today at a glance">
        <div className="flex items-center justify-between gap-3">
          <p className="num text-xl font-bold text-ink">{focusDone} of 3 today</p>
          <span className="num text-[13px] text-ink-3">{streakLabel(streak)}</span>
        </div>
        <p className="mt-1 text-[13px] text-ink-2">
          {countedToday ? "Today counted" : "Today not counted yet"}
        </p>
      </section>

      <section className="card p-4" aria-label="In focus today">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-ink">In focus today</h2>
          <Link to="/day" className="text-[13px] font-bold" style={{ color: "var(--blue-ink)" }}>
            Open Today
          </Link>
        </div>
        <ul className="mt-1 divide-y divide-line">
          {focus.length === 0 ? (
            <li className="py-4 text-sm text-ink-2">
              Nothing is picked for today. Tasks are picked on the Today screen.
            </li>
          ) : (
            focus.map((t) => {
              const hub = hubs.find((h) => h.id === t.hub_id);
              return (
                <li key={t.id} className="flex items-center gap-3 py-2.5">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-chip"
                    style={{ background: t.is_done ? "var(--mint)" : "var(--line-2)" }}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block truncate text-[15px] font-medium ${
                        t.is_done ? "strike text-ink-3" : "text-ink"
                      }`}
                    >
                      {t.title}
                    </span>
                    {hub ? (
                      <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-ink-2">
                        <span
                          className="h-2 w-2 rounded-chip"
                          style={{ background: hubColor(hub.color) }}
                          aria-hidden="true"
                        />
                        {hub.name}
                      </span>
                    ) : null}
                  </span>
                  <span className="label-xs shrink-0 text-ink-3">
                    {t.is_done ? "Closed" : "Open"}
                  </span>
                </li>
              );
            })
          )}
        </ul>
      </section>

      {softWarning ? (
        <BoundaryCard
          id="lumi-soft-pulse"
          left={`${billing.aiLimit - billing.aiUsed} of ${billing.aiLimit} Lumi requests left this month.`}
          stops="Lumi answers and drafts"
          continues="search across your docs and tasks, the halo, the streak and the focus timer"
          onDismiss={() => setSoftDismissed(true)}
        />
      ) : null}

      <Link
        to="/lumi"
        className="card block p-4"
        style={{
          background:
            "linear-gradient(140deg, color-mix(in oklab, var(--lilac) 20%, var(--paper)), var(--paper))",
        }}
      >
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <p className="label-xs" style={{ color: "var(--ink-2)" }}>
              Luvion AI
            </p>
            <p className="mt-1 text-[15px] font-bold text-ink">Ask Lumi about your work</p>
            <p className="mt-1 text-[13px] text-ink-2">
              Answers from your hubs and tasks, nothing invented
            </p>
          </div>
          <Lumi variant="idle" size={54} className="shrink-0" />
        </div>
      </Link>
    </div>
  );
}
