import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Check } from "lucide-react";
import { Lumi } from "@/components/Lumi";
import {
  PLANS,
  PLAN_AMOUNT,
  TIER_LABEL,
  formatPrice,
  regionCurrency,
  useBilling,
  type Tier,
} from "@/lib/billing";
import { checkSubscription, createCheckout, customerPortal } from "@/lib/billing.functions";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Plans — Luvion" },
      {
        name: "description",
        content:
          "Luvion plans: Free, Pro and Team. The halo, the streak and the focus timer are always free, and export works on every plan.",
      },
      { property: "og:title", content: "Plans — Luvion" },
      {
        property: "og:description",
        content: "What Free, Pro and Team include, and what happens when you cancel.",
      },
    ],
  }),
  component: PricingScreen,
});

function PricingScreen() {
  const { billing, refetch } = useBilling();
  const checkout = useServerFn(createCheckout);
  const portal = useServerFn(customerPortal);
  const check = useServerFn(checkSubscription);
  const [busy, setBusy] = useState<Tier | "portal" | "check" | null>(null);
  const [message, setMessage] = useState("");
  const [currency] = useState<"usd" | "eur">(() => regionCurrency());

  const start = async (tier: "pro" | "team") => {
    setMessage("");
    if (!billing.signedIn) {
      setMessage("Sign in first — a subscription has to belong to an account.");
      return;
    }
    setBusy(tier);
    try {
      const res = await checkout({ data: { tier, currency } });
      if (res.url) window.location.href = res.url;
      else setMessage(res.message);
    } catch (e) {
      setMessage(`Checkout did not open — ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="cascade space-y-4">
      <header className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
        <Lumi variant="idle" size={52} className="shrink-0" />
        <div className="min-w-0">
          <p className="label-xs text-ink-3">Current plan · {TIER_LABEL[billing.tier]}</p>
          <h1 className="screen-title text-[26px] leading-tight text-ink">Plans</h1>
        </div>
      </header>

      <p className="px-1 text-[14px] leading-relaxed text-ink-2">
        Less chaos. More structure. The halo, the streak and the focus timer are free on every
        plan and will never be paid. Paid boundaries only touch the number of hubs, boards and
        Lumi requests.
      </p>

      {!billing.stripeConfigured ? (
        <p className="card p-4 text-[14px] leading-relaxed text-ink-2">
          Payments aren't connected yet. This screen still works, and the plan you have keeps
          working as it is.
        </p>
      ) : null}


      {message ? (
        <p className="card p-4 text-[14px] leading-relaxed" style={{ color: "var(--ink-2)" }}>
          {message}
        </p>
      ) : null}

      <div className="space-y-3">
        {PLANS.filter((p) => p.key !== "team").map((plan) => {
          const current = billing.tier === plan.key;
          return (
            <section
              key={plan.key}
              aria-label={`${plan.name} plan`}
              className="card p-4"
              style={
                current
                  ? { borderColor: "var(--blue)", boxShadow: "var(--shadow-float)" }
                  : undefined
              }
            >
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="min-w-0">
                  <h2 className="screen-title text-[20px] text-ink">{plan.name}</h2>
                  <p className="mt-1 text-[13px] text-ink-2">{plan.summary}</p>
                </div>
                {current ? (
                  <span
                    className="shrink-0 rounded-chip px-3 py-1 text-[12px] font-bold"
                    style={{
                      background: "color-mix(in oklab, var(--blue) 12%, transparent)",
                      color: "var(--blue-ink)",
                    }}
                  >
                    Your plan
                  </span>
                ) : null}
              </div>

              <p className="num mt-3 text-xl font-bold text-ink">
                {plan.key === "free"
                  ? formatPrice(0, currency)
                  : `${formatPrice(PLAN_AMOUNT[plan.key][currency], currency)} per month`}
              </p>

              <ul className="mt-3 space-y-2">
                {plan.includes.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[14px] text-ink">
                    <Check
                      size={16}
                      aria-hidden="true"
                      className="mt-0.5 shrink-0"
                      style={{ color: "var(--mint-tx)" }}
                    />
                    <span className="min-w-0">{item}</span>
                  </li>
                ))}
              </ul>

              {plan.key !== "free" && !current ? (
                <button
                  type="button"
                  disabled={busy === plan.key}
                  onClick={() => start(plan.key as "pro" | "team")}
                  className="mt-4 min-h-12 w-full rounded-btn bg-blue-btn text-sm font-bold text-white disabled:opacity-60"
                >
                  {busy === plan.key ? "Opening checkout" : `Switch to ${plan.name}`}
                </button>
              ) : null}
            </section>
          );
        })}
      </div>

      <section className="card p-4" aria-label="What happens when you cancel">
        <h2 className="text-base font-extrabold text-ink">What happens when you cancel</h2>
        <ul className="mt-2 space-y-2 text-[14px] leading-relaxed text-ink-2">
          <li>Your data stays fully readable forever.</li>
          <li>
            Export to JSON, Markdown and CSV works always, including an expired subscription.
          </li>
          <li>
            Only creating beyond the limits and Lumi requests are restricted. Existing hubs,
            boards and docs still open and can be edited.
          </li>
          <li>
            Cancelling happens right here in two taps: the button below opens subscription
            management. You never have to write to support.
          </li>
        </ul>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={busy === "portal"}
            onClick={async () => {
              setMessage("");
              if (!billing.signedIn) {
                setMessage("Sign in to open subscription management.");
                return;
              }
              setBusy("portal");
              try {
                const res = await portal();
                if (res.url) window.location.href = res.url;
                else setMessage(res.message);
              } catch (e) {
                setMessage(`It did not open — ${(e as Error).message}`);
              } finally {
                setBusy(null);
              }
            }}
            className="min-h-11 rounded-btn border border-line-2 text-sm font-bold"
            style={{ color: "var(--blue-ink)" }}
          >
            Manage subscription
          </button>
          <button
            type="button"
            disabled={busy === "check"}
            onClick={async () => {
              setMessage("");
              if (!billing.signedIn) {
                setMessage("Sign in to check the subscription.");
                return;
              }
              setBusy("check");
              try {
                const res = await check();
                await refetch();
                setMessage(res.message || `Current plan: ${TIER_LABEL[res.tier as Tier]}.`);
              } catch (e) {
                setMessage(`The check failed — ${(e as Error).message}`);
              } finally {
                setBusy(null);
              }
            }}
            className="min-h-11 rounded-btn border border-line-2 text-sm font-bold"
            style={{ color: "var(--blue-ink)" }}
          >
            Check subscription
          </button>
        </div>
      </section>

      {!billing.signedIn ? (
        <p className="px-1 text-[13px] text-ink-2">
          A subscription belongs to an account.{" "}
          <Link to="/auth" style={{ color: "var(--blue-ink)" }}>
            Sign in or create an account
          </Link>
        </p>
      ) : null}
    </div>
  );
}
