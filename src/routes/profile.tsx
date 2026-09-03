import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Lumi } from "@/components/Lumi";
import { DataError } from "@/components/DataError";
import { ProfileSkeleton } from "@/components/skeletons";
import { useDelayedFlag } from "@/hooks/useDelayedFlag";
import { Sheet } from "@/components/Sheet";
import { supabase } from "@/integrations/supabase/client";
import { TIER_LABEL, useBilling } from "@/lib/billing";
import { exportCsv, exportJson, exportMarkdown } from "@/lib/export";
import { useDocs, useHubs } from "@/lib/app";
import { useServerFn } from "@tanstack/react-start";
import { deleteAccount } from "@/lib/account.functions";
import {
  announce,
  haloLevel,
  streakLabel,

  resetAllData,
  useAppState,
  useTasks,
  useUpdateState,
} from "@/lib/app";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Luvion" },
      {
        name: "description",
        content:
          "Halo level, best streak, plan and account, data export, privacy and terms, and account deletion in Luvion.",
      },
      { property: "og:title", content: "Profile — Luvion" },
      {
        property: "og:description",
        content: "Luvion settings: theme, Lumi, streaks, export and account.",
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
        <p className="t-body font-bold text-ink">{label}</p>
        <p className="t-aux text-ink-2">{hint}</p>
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
  const stateQ = useAppState();
  const tasksQ = useTasks();
  const hubsQ = useHubs();
  const docsQ = useDocs();
  const state = stateQ.data;
  const tasks = tasksQ.data ?? [];
  const hubs = hubsQ.data ?? [];
  const docs = docsQ.data ?? [];
  const loading = stateQ.isLoading || tasksQ.isLoading || hubsQ.isLoading || docsQ.isLoading;
  const failed = stateQ.isError || tasksQ.isError || hubsQ.isError || docsQ.isError;
  const showSkeleton = useDelayedFlag(loading);
  const { billing } = useBilling();
  const navigate = useNavigate();
  const update = useUpdateState();
  const qc = useQueryClient();
  const [confirm, setConfirm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const removeAccount = useServerFn(deleteAccount);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const streak = state?.streak ?? 0;
  const level = haloLevel(Math.max(streak, 1));
  const closed = tasks.filter((t) => t.is_done).length;

  if (loading) return showSkeleton ? <ProfileSkeleton /> : null;
  if (failed)
    return (
      <DataError
        error={stateQ.error ?? tasksQ.error ?? hubsQ.error ?? docsQ.error}
        onRetry={() => {
          stateQ.refetch();
          tasksQ.refetch();
          hubsQ.refetch();
          docsQ.refetch();
        }}
        what="your profile"
      />
    );

  return (
    <div className="cascade space-y-4">
      <header>
        <p className="label-xs text-ink-3">Your space</p>
        <h1 className="t-screen mt-1 text-ink">Profile</h1>
      </header>

      <section className="card p-5" aria-label="Halo level">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
          <Lumi variant="glow" size={68} className="shrink-0" breathe />
          <div className="min-w-0">
            <p className="label-xs" style={{ color: "var(--halo-tx)" }}>
              {streak > 0
                ? `${level.name} · day ${streak} of your streak`
                : `${level.name} · your streak has not started`}
            </p>
            <p className="num mt-1 t-section text-ink">{streakLabel(streak)}</p>

            <p className="mt-1 t-aux text-ink-2">
              Best {state?.best_streak ?? 0} · {closed} tasks closed
            </p>
          </div>
        </div>
      </section>

      <section className="card p-4" aria-label="Plan and account">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <h2 className="t-title text-ink">
              {TIER_LABEL[billing.tier]} plan
            </h2>
            <p className="mt-1 t-aux text-ink-2">
              {billing.signedIn
                ? `Lumi requests: ${billing.aiUsed} of ${billing.aiLimit} this month`
                : "Sign in to attach the plan and the request counter to an account"}
            </p>
          </div>
          <Link
            to="/pricing"
            className="grid min-h-11 shrink-0 place-items-center rounded-btn border border-line-2 px-3 t-aux font-bold"
            style={{ color: "var(--blue-ink)" }}
          >
            Plans
          </Link>
        </div>
        <p className="mt-3 t-aux text-ink-2">
          The halo, the streak and the focus timer are always free and do not depend on the plan.
        </p>
        <div className="mt-3">
          {billing.signedIn ? (
            <button
              type="button"
              onClick={async () => {
                await qc.cancelQueries();
                qc.clear();
                await supabase.auth.signOut();
                announce("Signed out");
                navigate({ to: "/auth", replace: true });
              }}
              className="min-h-11 w-full rounded-btn border border-line-2 text-sm font-bold"
              style={{ color: "var(--blue-ink)" }}
            >
              Sign out
            </button>
          ) : (
            <Link
              to="/auth"
              className="grid min-h-11 w-full place-items-center rounded-btn ring-on-solid bg-blue-btn text-sm font-bold text-white"
            >
              Sign in or create an account
            </Link>
          )}
        </div>
      </section>

      <section className="card p-4" aria-label="Export my data">
        <h2 className="t-title text-ink">Export my data</h2>
        <p className="mt-1 t-aux text-ink-2">
          Downloads your hubs, tasks and docs. Works on every plan, including an expired subscription. The data stays yours.
        </p>
        <button
          type="button"
          onClick={() => exportJson(hubs, tasks, docs)}
          className="mt-3 min-h-11 w-full rounded-btn ring-on-solid bg-blue-btn text-sm font-bold text-white"
        >
          Download JSON
        </button>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => exportMarkdown(hubs, tasks, docs)}
            className="min-h-11 rounded-btn border border-line-2 text-sm font-bold"
            style={{ color: "var(--blue-ink)" }}
          >
            Markdown
          </button>
          <button
            type="button"
            onClick={() => exportCsv(hubs, tasks)}
            className="min-h-11 rounded-btn border border-line-2 text-sm font-bold"
            style={{ color: "var(--blue-ink)" }}
          >
            CSV
          </button>
        </div>
      </section>

      <section className="card p-4" aria-label="Theme">
        <h2 className="t-title text-ink">Theme</h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[
            { key: "light", label: "Light" },
            { key: "dark", label: "Black and gold" },
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

      <section className="surface-sunk px-4 py-1" aria-label="Settings">
        <Toggle
          checked={state?.lumi_enabled ?? true}
          onChange={(v) => update.mutate({ lumi_enabled: v })}
          label="Lumi"
          hint="The assistant and its prompts in the interface"
        />
        <div className="h-px bg-line" />
        <Toggle
          checked={state?.streaks_enabled ?? true}
          onChange={(v) => update.mutate({ streaks_enabled: v })}
          label="Streaks"
          hint="The days in a row counter and the halo celebration"
        />
      </section>

      <section className="card p-4" aria-label="Data">
        <h2 className="t-title text-ink">Data</h2>
        <p className="mt-1 t-aux text-ink-2">
          Reset removes hubs, tasks, docs and chat history, and sets the streak back to zero.
        </p>
        {error ? (
          <p className="mt-2 t-aux" style={{ color: "var(--coral-tx)" }}>
            {error}
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => setConfirm(true)}
          className="mt-3 min-h-11 w-full rounded-btn border px-4 text-sm font-bold"
          style={{ borderColor: "var(--coral)", color: "var(--coral-tx)" }}
        >
          Reset data
        </button>
      </section>

      <section className="card p-4" aria-label="Legal">
        <h2 className="t-title text-ink">Privacy and terms</h2>
        <p className="mt-1 t-aux text-ink-2">
          What is collected, why, how long it is kept, and how to export or delete it.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link
            to="/privacy"
            className="grid min-h-11 place-items-center rounded-btn border border-line-2 text-sm font-bold"
            style={{ color: "var(--blue-ink)" }}
          >
            Privacy
          </Link>
          <Link
            to="/terms"
            className="grid min-h-11 place-items-center rounded-btn border border-line-2 text-sm font-bold"
            style={{ color: "var(--blue-ink)" }}
          >
            Terms
          </Link>
        </div>
      </section>

      {billing.signedIn ? (
        <section className="card p-4" aria-label="Delete account">
          <h2 className="t-title text-ink">Delete account</h2>
          <p className="mt-1 t-aux text-ink-2">
            Removes the account, the plan and the Lumi counter. Export your data first if you want
            a copy.
          </p>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="mt-3 min-h-11 w-full rounded-btn border px-4 text-sm font-bold"
            style={{ borderColor: "var(--coral)", color: "var(--coral-tx)" }}
          >
            Delete account
          </button>
        </section>
      ) : null}

      <Sheet
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete account"
      >
        <p className="t-body font-normal text-ink-2">
          The account, the plan and the Lumi request counter will be deleted permanently. This
          cannot be undone and support cannot restore it.
        </p>
        {error ? (
          <p className="mt-2 t-aux" style={{ color: "var(--coral-tx)" }}>
            {error}
          </p>
        ) : null}
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setConfirmDelete(false)}
            className="min-h-11 rounded-btn border border-line-2 text-sm font-bold text-ink-2"
          >
            Keep account
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setError("");
              try {
                const res = await removeAccount();
                if (!res.ok) {
                  setError(res.message);
                  return;
                }
                await supabase.auth.signOut();
                qc.clear();
                announce("Account deleted");
                setConfirmDelete(false);
                navigate({ to: "/", replace: true });
              } catch (e) {
                setError(
                  `Couldn't delete the account — ${(e as Error).message}. Nothing was removed, try again.`,
                );
              } finally {
                setBusy(false);
              }
            }}
            className="min-h-11 rounded-btn text-sm font-bold text-white"
            style={{ background: "var(--coral)" }}
          >
            {busy ? "Deleting" : "Delete account"}
          </button>
        </div>
      </Sheet>

      <Sheet open={confirm} onClose={() => setConfirm(false)} title="Reset all data">
        <p className="t-body font-normal text-ink-2">
          This cannot be undone. Hubs, tasks, docs and chat history will be removed.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setConfirm(false)}
            className="min-h-11 rounded-btn border border-line-2 text-sm font-bold text-ink-2"
          >
            Cancel
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
                announce("Data reset");
                setConfirm(false);
              } catch (e) {
                setError(
                  `Couldn't reset — ${(e as Error).message}. Check the connection and try again.`,
                );
              } finally {
                setBusy(false);
              }
            }}
            className="min-h-11 rounded-btn text-sm font-bold text-white"
            style={{ background: "var(--coral)" }}
          >
            {busy ? "Removing" : "Reset"}
          </button>
        </div>
      </Sheet>
    </div>
  );
}
