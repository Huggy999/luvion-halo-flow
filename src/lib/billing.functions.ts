import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function origin() {
  try {
    return new URL(getRequest().url).origin;
  } catch {
    return "";
  }
}

/** Current plan, Lumi request usage and whether payment is configured. */
export const getBilling = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { loadSubscriber, AI_LIMIT, stripeKey } = await import("@/lib/billing.server");
    const email = (context.claims["email"] as string | undefined) ?? "";
    const row = await loadSubscriber(context.userId, email);
    return {
      tier: row.tier,
      aiUsed: row.ai_calls_used,
      aiLimit: AI_LIMIT[row.tier],
      resetAt: row.ai_calls_reset_at,
      subscriptionEnd: row.subscription_end,
      stripeConfigured: stripeKey().length > 0,
      signedIn: true,
    };
  });

/** Server-side hub limit check: the client check is convenience, this one is protection. */
export const createHubGuarded = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        name: z.string().min(1).max(80),
        description: z.string().max(200).default(""),
        color: z.string().max(20).default("blue"),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { loadSubscriber, HUB_LIMIT } = await import("@/lib/billing.server");
    const email = (context.claims["email"] as string | undefined) ?? "";
    const row = await loadSubscriber(context.userId, email);
    const limit = HUB_LIMIT[row.tier];

    const { count } = await context.supabase
      .from("hubs")
      .select("id", { count: "exact", head: true });

    if (limit !== null && (count ?? 0) >= limit) {
      return {
        ok: false as const,
        reason: `${count ?? 0} of ${limit} hubs on the ${row.tier} plan. Existing hubs keep working.`,
      };
    }

    const { error } = await context.supabase.from("hubs").insert({
      name: data.name,
      description: data.description,
      color: data.color,
      position: count ?? 0,
    });
    if (error) return { ok: false as const, reason: error.message };
    return { ok: true as const, reason: "" };
  });

/** Server-side board access check for a specific hub. */
export const canUseBoard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ hubId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { loadSubscriber, BOARD_LIMIT } = await import("@/lib/billing.server");
    const email = (context.claims["email"] as string | undefined) ?? "";
    const row = await loadSubscriber(context.userId, email);
    const limit = BOARD_LIMIT[row.tier];
    if (limit === null) return { allowed: true as const };
    const { data: hubs } = await context.supabase
      .from("hubs")
      .select("id")
      .order("position", { ascending: true })
      .limit(limit);
    return { allowed: (hubs ?? []).some((h) => h.id === data.hubId) };
  });

/* ---------- Stripe ---------- */

export const createCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ tier: z.enum(["pro", "team"]) }).parse(data))
  .handler(async ({ data, context }) => {
    const { stripeKey, stripeCall, findOrCreateCustomer, PRICE, setTier } = await import(
      "@/lib/billing.server"
    );
    if (!stripeKey()) {
      return {
        url: null,
        message: "Payments are not connected yet. The app owner adds the Stripe key in the settings.",
      };
    }
    const email = (context.claims["email"] as string | undefined) ?? "";
    try {
      const customer = await findOrCreateCustomer(email, context.userId);
      await setTier(context.userId, { stripe_customer_id: customer });
      const plan = PRICE[data.tier];
      const session = (await stripeCall("checkout/sessions", {
        customer,
        mode: "subscription",
        "line_items[0][quantity]": "1",
        "line_items[0][price_data][currency]": "rub",
        "line_items[0][price_data][unit_amount]": String(plan.amount),
        "line_items[0][price_data][recurring][interval]": "month",
        "line_items[0][price_data][product_data][name]": plan.name,
        "subscription_data[metadata][tier]": data.tier,
        "subscription_data[metadata][user_id]": context.userId,
        success_url: `${origin()}/pricing?status=ok`,
        cancel_url: `${origin()}/pricing`,
      })) as { url?: string };
      return { url: session.url ?? null, message: "" };
    } catch (e) {
      return { url: null, message: `Checkout did not open: ${(e as Error).message}` };
    }
  });

export const checkSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { stripeKey, stripeCall, loadSubscriber, setTier, findOrCreateCustomer } = await import(
      "@/lib/billing.server"
    );
    const email = (context.claims["email"] as string | undefined) ?? "";
    const row = await loadSubscriber(context.userId, email);
    if (!stripeKey()) {
      return { tier: row.tier, message: "Payments are not connected yet." };
    }
    try {
      const customer = row.stripe_customer_id ?? (await findOrCreateCustomer(email, context.userId));
      const subs = (await stripeCall(
        "subscriptions",
        { customer, status: "active", limit: "1" },
        "GET",
      )) as {
        data?: { current_period_end: number; metadata?: { tier?: string } }[];
      };
      const sub = subs.data?.[0];
      if (!sub) {
        await setTier(context.userId, { tier: "free", stripe_customer_id: customer, subscription_end: null });
        return { tier: "free" as const, message: "No active subscription. You are on Free." };
      }
      const tier = sub.metadata?.tier === "team" ? "team" : "pro";
      await setTier(context.userId, {
        tier,
        stripe_customer_id: customer,
        subscription_end: new Date(sub.current_period_end * 1000).toISOString(),
      });
      return { tier, message: "" };
    } catch (e) {
      return { tier: row.tier, message: `The check failed: ${(e as Error).message}` };
    }
  });

export const customerPortal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { stripeKey, stripeCall, loadSubscriber, findOrCreateCustomer } = await import(
      "@/lib/billing.server"
    );
    if (!stripeKey()) {
      return { url: null, message: "Payments are not connected yet, so there is nothing to cancel." };
    }
    const email = (context.claims["email"] as string | undefined) ?? "";
    const row = await loadSubscriber(context.userId, email);
    try {
      const customer = row.stripe_customer_id ?? (await findOrCreateCustomer(email, context.userId));
      const portal = (await stripeCall("billing_portal/sessions", {
        customer,
        return_url: `${origin()}/pricing`,
      })) as { url?: string };
      return { url: portal.url ?? null, message: "" };
    } catch (e) {
      return { url: null, message: `The subscription portal did not open: ${(e as Error).message}` };
    }
  });
