import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Lumi } from "@/components/Lumi";
import {
  HUB_TEMPLATES,
  announce,
  useHubMutations,
  useTaskMutations,
  useUpdateState,
} from "@/lib/app";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Set up Luvion" },
      {
        name: "description",
        content:
          "Four short steps: your name, the areas you work in, three tasks for today and the first focus session.",
      },
      { property: "og:title", content: "Set up Luvion" },
      {
        property: "og:description",
        content: "Name, areas, three tasks, first session. About a minute.",
      },
    ],
  }),
  component: OnboardingScreen,
});

const STEPS = 4;

function OnboardingScreen() {
  const navigate = useNavigate();
  const { createHub } = useHubMutations();
  const { createTask } = useTaskMutations();
  const updateState = useUpdateState();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [areas, setAreas] = useState<string[]>(["Work", "Personal"]);
  const [picked, setPicked] = useState<string[]>([]);
  const [own, setOwn] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const templates = useMemo(
    () => HUB_TEMPLATES.filter((t) => areas.includes(t.name)),
    [areas],
  );

  const toggleArea = (n: string) => {
    setError("");
    setAreas((prev) =>
      prev.includes(n)
        ? prev.filter((a) => a !== n)
        : prev.length >= 3
          ? prev
          : [...prev, n],
    );
  };

  const togglePick = (title: string) => {
    setError("");
    setPicked((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : prev.length >= 3
          ? prev
          : [...prev, title],
    );
  };

  const finish = async () => {
    setSaving(true);
    setError("");
    try {
      const hubIds = new Map<string, string>();
      for (const t of templates) {
        const hub = await createHub.mutateAsync({
          name: t.name,
          description: t.description,
          color: t.color,
        });
        hubIds.set(t.name, hub.id);
      }
      for (const title of picked) {
        const owner = templates.find((t) => t.tasks.includes(title));
        await createTask.mutateAsync({
          title,
          hub_id: owner ? (hubIds.get(owner.name) ?? null) : (hubIds.get(templates[0]?.name ?? "") ?? null),
          priority: "p2",
          is_today: true,
        });
      }
      await updateState.mutateAsync({
        onboarded: true,
        display_name: name.trim(),
        streak: 0,
        halo_log: [],
      });
      announce("Setup finished");
      navigate({ to: "/day" });
    } catch (e) {
      setError(`Setup could not be saved — ${(e as Error).message}. Try the step again.`);
      setSaving(false);
    }
  };

  const next = () => {
    if (step === 1 && !name.trim()) {
      setError("Lumi needs a name to use. Enter the name you go by.");
      return;
    }
    if (step === 2 && areas.length === 0) {
      setError("Pick at least one area. You can add more hubs later.");
      return;
    }
    if (step === 3 && picked.length !== 3) {
      setError(`Pick exactly three tasks. ${picked.length} of 3 chosen so far.`);
      return;
    }
    setError("");
    setStep((s) => Math.min(STEPS, s + 1));
  };

  return (
    <div className="cascade space-y-5">
      <div>
        <p className="label-xs text-ink-3">Step {step} of {STEPS}</p>
        <div
          className="mt-2 h-1.5 w-full rounded-chip bg-line"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={STEPS}
          aria-valuenow={step}
          aria-label="Setup progress"
        >
          <span
            className="block h-full rounded-chip transition-all"
            style={{ width: `${(step / STEPS) * 100}%`, background: "var(--blue)" }}
          />
        </div>
      </div>

      {step === 1 ? (
        <section className="space-y-3">
          <h1 className="screen-title text-[26px] leading-tight text-ink">
            What should Lumi call you
          </h1>
          <label className="block">
            <span className="label-xs text-ink-3">Your name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="mt-1 min-h-12 w-full rounded-btn border border-line-2 bg-paper px-3 text-ink"
              placeholder="For example, Alex"
            />
          </label>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="space-y-3">
          <h1 className="screen-title text-[26px] leading-tight text-ink">
            Which areas do you work in
          </h1>
          <p className="text-[13px] text-ink-2">
            Choose one to three. Each one becomes a hub with its tasks, board and docs.
          </p>
          <ul className="grid grid-cols-2 gap-2">
            {HUB_TEMPLATES.map((t) => {
              const on = areas.includes(t.name);
              return (
                <li key={t.name}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleArea(t.name)}
                    className="min-h-16 w-full rounded-tile border px-3 py-2 text-left"
                    style={{ borderColor: on ? "var(--ink)" : "var(--line-2)" }}
                  >
                    <span className="block text-[15px] font-bold text-ink">{t.name}</span>
                    <span className="block text-[12px] text-ink-2">{t.description}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="text-[13px] text-ink-3">{areas.length} of 3 chosen</p>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="space-y-4">
          <h1 className="screen-title text-[26px] leading-tight text-ink">
            Three tasks for today
          </h1>
          <p className="text-[13px] text-ink-2">
            Pick exactly three. {picked.length} of 3 chosen.
          </p>
          {templates.map((t) => (
            <div key={t.name}>
              <p className="label-xs text-ink-3">{t.name}</p>
              <ul className="mt-2 space-y-2">
                {t.tasks.map((title) => {
                  const on = picked.includes(title);
                  return (
                    <li key={title}>
                      <button
                        type="button"
                        aria-pressed={on}
                        onClick={() => togglePick(title)}
                        className="min-h-11 w-full rounded-btn border px-3 text-left text-[15px] text-ink"
                        style={{ borderColor: on ? "var(--ink)" : "var(--line-2)" }}
                      >
                        {title}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const v = own.trim();
              if (!v) return;
              togglePick(v);
              setOwn("");
            }}
            className="grid grid-cols-[minmax(0,1fr)_auto] gap-2"
          >
            <input
              value={own}
              onChange={(e) => setOwn(e.target.value)}
              aria-label="Write your own task"
              placeholder="or write your own"
              className="min-h-11 w-full rounded-btn border border-line-2 bg-paper px-3 text-ink"
            />
            <button
              type="submit"
              className="min-h-11 rounded-btn border border-line-2 px-4 text-sm font-bold text-ink"
            >
              Add
            </button>
          </form>
          {picked.filter((p) => !templates.some((t) => t.tasks.includes(p))).length > 0 ? (
            <ul className="space-y-2">
              {picked
                .filter((p) => !templates.some((t) => t.tasks.includes(p)))
                .map((p) => (
                  <li key={p}>
                    <button
                      type="button"
                      aria-pressed
                      onClick={() => togglePick(p)}
                      className="min-h-11 w-full rounded-btn border px-3 text-left text-[15px] text-ink"
                      style={{ borderColor: "var(--ink)" }}
                    >
                      {p}
                    </button>
                  </li>
                ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      {step === 4 ? (
        <section className="space-y-3 text-center">
          <Lumi variant="glow" size={96} className="mx-auto" />
          <h1 className="screen-title text-[26px] leading-tight text-ink">
            Start your first session
          </h1>
          <p className="text-[14px] leading-relaxed text-ink-2">
            {name.trim() ? `${name.trim()}, your ` : "Your "}three tasks are on Today with a timer
            ready to run. Close one task a day and the halo grows.
          </p>
        </section>
      ) : null}

      {error ? (
        <p className="text-[13px]" style={{ color: "var(--coral-tx)" }}>
          {error}
        </p>
      ) : null}

      <div className="space-y-2">
        {step < STEPS ? (
          <button
            type="button"
            onClick={next}
            className="min-h-12 w-full rounded-btn bg-blue-btn text-sm font-bold text-white"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={finish}
            disabled={saving}
            className="min-h-12 w-full rounded-btn bg-blue-btn text-sm font-bold text-white disabled:opacity-60"
          >
            {saving ? "Setting things up" : "Start your first session"}
          </button>
        )}
        {step > 1 ? (
          <button
            type="button"
            onClick={() => {
              setError("");
              setStep((s) => s - 1);
            }}
            className="min-h-12 w-full rounded-btn border border-line-2 text-sm font-bold text-ink"
          >
            Back
          </button>
        ) : null}
      </div>
    </div>
  );
}
