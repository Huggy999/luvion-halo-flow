import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lumi } from "@/components/Lumi";
import { supabase } from "@/integrations/supabase/client";
import { announce } from "@/lib/app";
import { useSessionUser } from "@/lib/billing";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Luvion" },
      {
        name: "description",
        content:
          "Sign in or create a Luvion account with email and password. Your plan and Lumi requests belong to the account.",
      },
      { property: "og:title", content: "Sign in — Luvion" },
      {
        property: "og:description",
        content: "A Luvion account keeps your plan and your Lumi request count.",
      },
    ],
  }),
  component: AuthScreen,
});

function AuthScreen() {
  const navigate = useNavigate();
  const { user, ready } = useSessionUser();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (ready && user) navigate({ to: "/profile", replace: true });
  }, [ready, user, navigate]);

  const submit = async () => {
    setError("");
    setNote("");
    if (!email.trim() || password.length < 6) {
      setError("Enter an email and a password of at least six characters.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "in") {
        const { error: err } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (err) throw err;
        announce("Signed in");
        navigate({ to: "/profile", replace: true });
      } else {
        const { error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${window.location.origin}/profile` },
        });
        if (err) throw err;
        setNote("Account created. If email confirmation is required, confirm the message and sign in.");
      }
    } catch (e) {
      setError(`Couldn't continue — ${(e as Error).message}. Check the details and try again.`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="cascade space-y-4">
      <header className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
        <Lumi variant="glow" size={56} className="shrink-0" breathe />
        <div className="min-w-0">
          <p className="label-xs text-ink-3">Luvion</p>
          <h1 className="screen-title text-[26px] leading-tight text-ink">
            {mode === "in" ? "Sign in" : "Create account"}
          </h1>
        </div>
      </header>

      <section className="card p-4">
        <p className="text-[14px] leading-relaxed text-ink-2">
          Less chaos. More structure. An account keeps your plan and Lumi requests with you. The
          halo, the streak and the focus timer are free on every plan.
        </p>

        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="label-xs text-ink-3">Email</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 min-h-11 w-full rounded-btn border border-line-2 bg-bg px-3 text-ink"
              placeholder="name@example.com"
            />
          </label>
          <label className="block">
            <span className="label-xs text-ink-3">Password</span>
            <input
              type="password"
              autoComplete={mode === "in" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 min-h-11 w-full rounded-btn border border-line-2 bg-bg px-3 text-ink"
              placeholder="At least six characters"
            />
          </label>
        </div>

        {error ? (
          <p className="mt-3 text-[13px]" style={{ color: "var(--coral-tx)" }}>
            {error}
          </p>
        ) : null}
        {note ? <p className="mt-3 text-[13px] text-ink-2">{note}</p> : null}

        <button
          type="button"
          disabled={busy}
          onClick={submit}
          className="mt-4 min-h-12 w-full rounded-btn bg-blue-btn text-sm font-bold text-white disabled:opacity-60"
        >
          {busy ? "Sending" : mode === "in" ? "Sign in" : "Create account"}
        </button>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "in" ? "up" : "in");
            setError("");
            setNote("");
          }}
          className="mt-2 min-h-11 w-full rounded-btn border border-line-2 text-sm font-bold"
          style={{ color: "var(--blue-ink)" }}
        >
          {mode === "in" ? "I don\u2019t have an account yet" : "I already have an account"}
        </button>
      </section>

      <p className="px-1 text-[13px] text-ink-2">
        The app also opens without an account: tasks, the board, docs, the halo and the timer all
        work. <Link to="/" style={{ color: "var(--blue-ink)" }}>Back to Pulse</Link>
      </p>
    </div>
  );
}
