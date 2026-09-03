import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Lumi } from "@/components/Lumi";
import { TaskRow } from "@/components/TaskRow";
import {
  haloLevel,
  STREAK_EVENT,
  todayISO,
  useAppState,
  useHubs,
  useTaskMutations,
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
          "The daily pulse in Luvion: the halo streak, counters of closed tasks and what is in focus today.",
      },
      { property: "og:title", content: "Pulse — Luvion" },
      {
        property: "og:description",
        content: "The halo streak, counters and today's focus on one screen.",
      },
    ],
  }),
  component: PulseScreen,
});

// Week start follows the browser locale: Monday in most of the EU, Sunday in the US.
function localeFirstDay() {
  try {
    const loc = new Intl.Locale(navigator.language) as Intl.Locale & {
      weekInfo?: { firstDay: number };
      getWeekInfo?: () => { firstDay: number };
    };
    const info = loc.getWeekInfo ? loc.getWeekInfo() : loc.weekInfo;
    if (info?.firstDay) return info.firstDay % 7; // 7 (Sunday) -> 0
  } catch {
    // fall through to Monday
  }
  return 1;
}

function weekdayLabels(firstDay: number) {
  const fmt = new Intl.DateTimeFormat(undefined, { weekday: "short" });
  const base = new Date(Date.UTC(2024, 0, 7)); // a Sunday
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setUTCDate(base.getUTCDate() + ((firstDay + i) % 7));
    return fmt.format(d);
  });
}

function isoOf(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

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
  const { completeTask } = useTaskMutations();
  const { billing } = useBilling();
  const [softDismissed, setSoftDismissed] = useState(false);
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
  const progress = level.next
    ? Math.min(1, (streak - (level.min - 1)) / (level.next - (level.min - 1)))
    : 1;

  const doneToday = tasks.filter((t) => t.done_at?.slice(0, 10) === today).length;
  const focus = tasks.filter((t) => t.is_today);
  const doneTotal = tasks.filter((t) => t.is_done).length;

  const week = useMemo(() => {
    const firstDay = localeFirstDay();
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - ((now.getDay() - firstDay + 7) % 7));
    const doneDays = new Set(
      tasks.filter((t) => t.done_at).map((t) => t.done_at!.slice(0, 10)),
    );
    return weekdayLabels(firstDay).map((label, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const iso = isoOf(d);
      return { label, iso, day: d.getDate(), counted: doneDays.has(iso), isToday: iso === today };
    });
  }, [tasks, today]);

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
        className="card relative overflow-hidden p-5"
        style={{
          background:
            "linear-gradient(150deg, color-mix(in oklab, var(--halo) 22%, var(--paper)), var(--paper))",
        }}
        aria-label="Halo and streak"
      >
        <Celebration streak={streak} />
        <div className="grid grid-cols-[112px_minmax(0,1fr)] items-center gap-4">
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
          <div className="min-w-0">
            <p className="label-xs" style={{ color: "var(--halo-tx)" }}>
              Halo · {level.name}
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
                    ? `${level.next - streak} to ${haloLevel(level.next).name}`
                    : "Highest halo level"}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          {[
            { k: "Today", v: focus.length },
            { k: "All", v: tasks.length },
            { k: "Closed", v: doneTotal },
          ].map((c) => (
            <div key={c.k} className="rounded-tile border border-line bg-paper px-3 py-2.5">
              <p className="num text-xl font-bold text-ink">{c.v}</p>
              <p className="label-xs mt-0.5 text-ink-3">{c.k}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-4" aria-label="This week">
        <div className="flex items-center justify-between">
          {week.map((d) => (
            <div key={d.iso} className="flex flex-col items-center gap-1.5">
              <span className="label-xs text-ink-3">{d.label}</span>
              <span
                className={`num grid h-9 w-9 place-items-center rounded-chip text-[13px] font-bold ${
                  d.isToday ? "border-2" : ""
                }`}
                style={{
                  borderColor: d.isToday ? "var(--blue)" : "transparent",
                  color: d.counted ? "var(--halo-tx)" : "var(--ink-2)",
                  background: d.counted
                    ? "color-mix(in oklab, var(--halo) 30%, transparent)"
                    : "transparent",
                }}
              >
                {d.day}
              </span>
              <span
                className="h-1.5 w-1.5 rounded-chip"
                style={{ background: d.counted ? "var(--halo)" : "var(--line-2)" }}
                aria-hidden="true"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="card p-4" aria-label="In focus today">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-ink">In focus today</h2>
          <span className="num text-[13px] text-ink-3">
            {doneToday} of {focus.length}
          </span>
        </div>
        <div className="mt-1 divide-y divide-line">
          {focus.length === 0 ? (
            <p className="py-4 text-sm text-ink-2">
              Nothing is picked for today. Tasks are added on the Today screen.
            </p>
          ) : (
            focus.map((t) => (
              <TaskRow
                key={t.id}
                task={t}
                hub={hubs.find((h) => h.id === t.hub_id)}
                onToggle={() => completeTask.mutate(t)}
              />
            ))
          )}
        </div>
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
