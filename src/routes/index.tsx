import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowUpRight, Flame, Target } from "lucide-react";
import { Lumi } from "@/components/Lumi";
import { Button } from "@/components/Button";
import { HaloRing } from "@/components/HaloRing";
import { HaloSheet } from "@/components/HaloSheet";
import {
  haloLevel,
  haloSkin,
  hubColor,
  STREAK_EVENT,
  todayISO,
  useAppState,
  useHaloGuard,
  useHubs,
  useTasks,
  useUpdateState,
} from "@/lib/app";
import { BoundaryCard } from "@/components/BoundaryCard";
import { DataError } from "@/components/DataError";
import { PulseSkeleton } from "@/components/skeletons";
import { useDelayedFlag } from "@/hooks/useDelayedFlag";
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

function Welcome() {
  return (
    <div className="cascade flex min-h-[80vh] flex-col justify-center gap-6 text-center">
      <Lumi variant="glow" size={128} className="mx-auto" label="Lumi" draw interactive />
      <div>
        <h1 className="t-screen text-ink">Luvion</h1>
        <p className="mt-2 t-title" style={{ color: "var(--halo-tx)" }}>
          Less chaos. More structure.
        </p>
        <p className="mt-3 t-body text-ink-2">
          Three tasks a day, the hubs they belong to and a focus timer that keeps the day moving.
        </p>
      </div>
      <div className="space-y-3">
        <Link
          to="/onboarding"
          className="flex min-h-12 w-full items-center justify-center rounded-btn bg-[var(--blue-btn)] text-[14px] font-bold text-white hover:bg-[color-mix(in_srgb,var(--blue-btn)_86%,black)]"
        >
          Get started
        </Link>
        <Link to="/auth" className="block t-body font-normal text-ink-2">
          I already have an account
        </Link>
      </div>
    </div>
  );
}

function PulseScreen() {
  const stateQ = useAppState();
  const tasksQ = useTasks();
  const hubsQ = useHubs();
  const state = stateQ.data;
  const tasks = tasksQ.data ?? [];
  const hubs = hubsQ.data ?? [];
  const loading = stateQ.isLoading || tasksQ.isLoading || hubsQ.isLoading;
  const failed = stateQ.isError || tasksQ.isError || hubsQ.isError;
  const showSkeleton = useDelayedFlag(loading);
  const { billing } = useBilling();
  const updateState = useUpdateState();
  useHaloGuard();

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

  if (loading) return showSkeleton ? <PulseSkeleton /> : null;
  if (failed)
    return (
      <DataError
        error={stateQ.error ?? tasksQ.error ?? hubsQ.error}
        onRetry={() => {
          stateQ.refetch();
          tasksQ.refetch();
          hubsQ.refetch();
        }}
        what="your day"
      />
    );
  if (state && !state.onboarded) return <Welcome />;

  return (
    <div className="cascade space-y-4">
      <header className="page-header">
        <p className="section-kicker label-xs text-ink-3">{dateLabel}</p>
        <h1 className="t-screen mt-1 text-ink">
          {state?.display_name ? `Pulse · ${state.display_name}` : "Pulse"}
        </h1>
      </header>

      {state?.freeze_notice ? (
        <section className="card p-4" aria-live="polite">
          <p className="t-body text-ink">Your halo held. One pause left this month.</p>
          <Button
            variant="secondary"
            onClick={() => updateState.mutate({ freeze_notice: false })}
            className="mt-2 text-ink"
          >
            Got it
          </Button>
        </section>
      ) : null}


      <section
        className="halo-stage celestial-pulse premium-card card relative overflow-hidden"
        aria-label="Halo and streak"
      >
        <Celebration streak={streak} />
        <button
          type="button"
          onClick={() => setHaloOpen(true)}
          aria-label="Open the halo levels"
          className="celestial-pulse-trigger block w-full p-5 text-left transition-transform duration-200 active:scale-[0.985]"
        >
          <div className="celestial-pulse-grid grid grid-cols-[128px_minmax(0,1fr)] items-center gap-4">
            <div className="celestial-orb-wrap">
              <span className="celestial-orbit celestial-orbit-a" aria-hidden="true" />
              <span className="celestial-orbit celestial-orbit-b" aria-hidden="true" />
              <HaloRing skin={haloSkin(streak)} progress={progress} size={112}>
                <Lumi
                  variant={streak > 0 ? "glow" : "sleep"}
                  size={62}
                  className={flash ? "halo-flash" : ""}
                  draw
                  interactive
                />

              </HaloRing>

              <p className="label-xs mt-2 text-center text-ink-2">
                {nextName ? `${level.name} → ${nextName}` : `${level.name} · highest level`}
              </p>
            </div>
            <div className="min-w-0">
              <p className="t-aux font-bold" style={{ color: "var(--halo-tx)" }}>
                {streak > 0
                  ? `${level.name} · day ${streak} of your streak`
                  : `${level.name} · your streak has not started`}
              </p>
              <p className="t-hero mt-1 overflow-hidden text-ink">
                <span className={flash ? "roll inline-block" : "inline-block"}>{streak}</span>
                <span className="ml-2 t-body text-ink-2">
                  {streak === 1 ? "day in a row" : "days in a row"}
                </span>
              </p>
              <p className="mt-1.5 t-aux text-ink-2">
                {!state?.streaks_enabled
                  ? "Streaks are turned off in Profile"
                  : streak === 0
                    ? "Close one task a day and the halo grows"
                    : level.next
                      ? `${level.next - streak} more days to ${nextName}`
                      : "Highest halo level"}
              </p>
              <p className="mt-2 inline-flex items-center gap-1 t-aux font-bold text-blue-ink">
                Explore levels <ArrowUpRight size={14} aria-hidden="true" />
              </p>
            </div>
          </div>
        </button>
      </section>

      <HaloSheet
        open={haloOpen}
        onClose={() => setHaloOpen(false)}
        streak={streak}
        log={state?.halo_log ?? []}
      />

      <section className="metric-grid grid grid-cols-2 gap-3" aria-label="Daily progress">
        <div className="metric-tile premium-card card p-4">
          <span className="icon-orb h-9 w-9 rounded-[12px]" aria-hidden="true">
            <Target size={17} />
          </span>
          <p className="mt-3 t-aux text-ink-2">Daily focus</p>
          <p className="num mt-0.5 t-section text-ink">{focusDone} of 3</p>
          <span className="progress-rail mt-3 block h-1.5 rounded-chip">
            <span className="progress-fill block h-full rounded-chip" style={{ width: `${(focusDone / 3) * 100}%` }} />
          </span>
        </div>
        <div className="metric-tile premium-card card p-4">
          <span className="icon-orb icon-orb-halo h-9 w-9 rounded-[12px]" aria-hidden="true">
            <Flame size={17} />
          </span>
          <p className="mt-3 t-aux text-ink-2">Current streak</p>
          <p className="num mt-0.5 t-section text-ink">{streak} {streak === 1 ? "day" : "days"}</p>
          <div className="streak-pips mt-3 flex gap-1.5" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => <span key={i} className={i < Math.min(streak, 5) ? "is-lit" : ""} />)}
          </div>
        </div>
      </section>


      <section className="premium-card card p-4" aria-label="Today at a glance">
        <div className="flex items-center justify-between gap-3">
          <h2 className="t-title text-ink">In focus today</h2>
          <Link to="/day" className="t-aux font-bold" style={{ color: "var(--blue-ink)" }}>
            Open Today
          </Link>
        </div>
        <p className="num mt-2 t-section text-ink">{focusDone} of 3 today</p>
        <p className="mt-1 t-aux text-ink-2">
          {countedToday ? "Today counted" : "Today not counted yet"}
        </p>
        <ul className="surface-sunk mt-3 divide-y divide-line px-3">
          {focus.length === 0 ? (
            <li className="py-4 t-body font-normal text-ink-2">
              Nothing is picked for today. Tasks are picked on the Today screen.
            </li>
          ) : (
            focus.map((t) => {
              const hub = hubs.find((h) => h.id === t.hub_id);
              return (
                <li key={t.id} className="task-glass flex items-center gap-3 rounded-tile px-2 py-2.5">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-chip"
                    style={{ background: t.is_done ? "var(--mint)" : "var(--line-2)" }}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block truncate t-body ${
                        t.is_done ? "strike text-ink-3" : "text-ink"
                      }`}
                    >
                      {t.title}
                    </span>
                    {hub ? (
                      <span className="mt-0.5 flex items-center gap-1.5 label-xs text-ink-2">
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
        className="premium-card card block overflow-hidden p-4"
      >
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <p className="label-xs" style={{ color: "var(--ink-2)" }}>
              Luvion AI
            </p>
            <p className="mt-1 t-body font-bold text-ink">Ask Lumi about your work</p>
            <p className="mt-1 t-aux text-ink-2">
              Answers from your hubs and tasks, nothing invented
            </p>
          </div>
          <Lumi variant="idle" size={54} className="shrink-0" />
        </div>
      </Link>
    </div>
  );
}
