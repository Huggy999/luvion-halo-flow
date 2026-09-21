import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lumi } from "@/components/Lumi";
import { Field } from "@/components/Field";
import { Button } from "@/components/Button";
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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="auth-airy cascade flex min-h-[calc(100dvh-3rem)] flex-col items-center">
      <header className="auth-brand flex flex-col items-center text-center">
        <div className="auth-lumi-wrap">
          <Lumi variant="glow" size={68} breathe interactive label="Lumi" />
        </div>
        <p className="label-xs mt-3 text-ink-3">Luvion</p>
        <h1 className="mt-7 t-screen text-ink">
          {mode === "in" ? "Welcome back" : "Create your space"}
        </h1>
        <p className="mt-2 t-aux text-ink-2">
          {mode === "in" ? "Enter your details to continue" : "Start with a simple, focused workspace"}
        </p>
      </header>

      <section className="auth-form mt-10 w-full">
        <div className="space-y-5">
          <Field
            id="auth-email"
            label="Email address"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="auth-field"
          />
          <div className="relative">
            <span className="block">
              <Field
                id="auth-password"
                label="Password"
                type={showPassword ? "text" : "password"}
                autoComplete={mode === "in" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least six characters"
                hint="At least six characters. Nothing else is required."
                error={error || undefined}
                fieldClassName="pr-20"
                className="auth-field"
              />
              <Button
                variant="ghost"
                onClick={() => setShowPassword((v) => !v)}
                aria-pressed={showPassword}
                className="absolute right-1 top-[25px] px-3 t-aux text-blue-ink"
              >
                {showPassword ? "Hide" : "Show"}
              </Button>
            </span>
          </div>
        </div>

        {note ? <p className="mt-3 t-aux text-ink-2">{note}</p> : null}

        <Button variant="primary" size="lg" block loading={busy} onClick={submit} className="auth-submit mt-6">
          {mode === "in" ? "Sign in" : "Create account"}
        </Button>

        <Button
          variant="secondary"
          block
          onClick={() => {
            setMode(mode === "in" ? "up" : "in");
            setError("");
            setNote("");
          }}
          className="mt-3"
        >
          {mode === "in" ? "I don\u2019t have an account yet" : "I already have an account"}
        </Button>
      </section>

      <div className="auth-divider mt-8 flex w-full items-center gap-4" aria-hidden="true">
        <span className="h-px flex-1 bg-line" />
        <span className="label-xs text-ink-3">Or</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <p className="mt-7 px-2 text-center t-aux text-ink-2">
        You can preview Luvion without an account. Sign in to create and keep tasks, plans, docs, your halo, and focus sessions.
        <Link to="/" className="ml-1 font-bold text-blue-ink">Preview Pulse</Link>
      </p>
    </div>
  );
}
